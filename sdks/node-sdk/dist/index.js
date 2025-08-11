import { GroupUpdatedCodec, ContentTypeGroupUpdated } from '@xmtp/content-type-group-updated';
import { ContentTypeText, TextCodec } from '@xmtp/content-type-text';
import { generateInboxId as generateInboxId$1, getInboxIdForIdentifier as getInboxIdForIdentifier$1, createClient as createClient$1, verifySignedWithPublicKey, isAddressAuthorized, isInstallationAuthorized } from '@xmtp/node-bindings';
export { ConsentEntityType, ConsentState, ConversationType, DeliveryStatus, GroupMember, GroupMembershipState, GroupMessageKind, GroupMetadata, GroupPermissions, GroupPermissionsOptions, IdentifierKind, LogLevel, MetadataField, PermissionLevel, PermissionPolicy, PermissionUpdateType, SignatureRequestType, SortDirection } from '@xmtp/node-bindings';
import { ContentTypeId } from '@xmtp/content-type-primitives';
import { join } from 'node:path';
import process from 'node:process';
import bindingsVersion from '@xmtp/node-bindings/version.json' with { type: 'json' };

/**
 * Pre-configured URLs for the XMTP network based on the environment
 *
 * @constant
 * @property {string} local - The local URL for the XMTP network
 * @property {string} dev - The development URL for the XMTP network
 * @property {string} production - The production URL for the XMTP network
 */
const ApiUrls = {
    local: "http://localhost:5556",
    dev: "https://grpc.dev.xmtp.network:443",
    production: "https://grpc.production.xmtp.network:443",
};
/**
 * Pre-configured URLs for the XMTP history sync service based on the environment
 *
 * @constant
 * @property {string} local - The local URL for the XMTP history sync service
 * @property {string} dev - The development URL for the XMTP history sync service
 * @property {string} production - The production URL for the XMTP history sync service
 */
const HistorySyncUrls = {
    local: "http://localhost:5558",
    dev: "https://message-history.dev.ephemera.network",
    production: "https://message-history.production.ephemera.network",
};

class AsyncStream {
    #done = false;
    #resolveNext;
    #rejectNext;
    #queue;
    #error;
    onReturn = undefined;
    onError = undefined;
    constructor() {
        this.#queue = [];
        this.#resolveNext = null;
        this.#rejectNext = null;
        this.#error = null;
        this.#done = false;
    }
    #endStream() {
        this.#queue = [];
        this.#resolveNext = null;
        this.#rejectNext = null;
        this.#done = true;
    }
    get error() {
        return this.#error;
    }
    get isDone() {
        return this.#done;
    }
    callback = (error, value) => {
        if (error) {
            this.#error = error;
            if (this.#rejectNext) {
                this.#rejectNext(error);
                this.#endStream();
                this.onError?.(error);
            }
            return;
        }
        if (this.#done) {
            return;
        }
        if (this.#resolveNext) {
            this.#resolveNext({
                done: false,
                value,
            });
            this.#resolveNext = null;
            this.#rejectNext = null;
        }
        else {
            this.#queue.push(value);
        }
    };
    next = () => {
        if (this.#error) {
            this.#endStream();
            this.onError?.(this.#error);
            return Promise.reject(this.#error);
        }
        if (this.#queue.length > 0) {
            return Promise.resolve({
                done: false,
                value: this.#queue.shift(),
            });
        }
        if (this.#done) {
            return Promise.resolve({
                done: true,
                value: undefined,
            });
        }
        return new Promise((resolve, reject) => {
            this.#resolveNext = resolve;
            this.#rejectNext = reject;
        });
    };
    return = (value) => {
        this.#endStream();
        this.onReturn?.();
        return Promise.resolve({
            done: true,
            value,
        });
    };
    [Symbol.asyncIterator]() {
        return this;
    }
}

function nsToDate(ns) {
    return new Date(ns / 1_000_000);
}

/**
 * Represents a decoded XMTP message
 *
 * This class transforms network messages into a structured format with
 * content decoding.
 *
 * @class
 * @property {any} content - The decoded content of the message
 * @property {ContentTypeId} contentType - The content type of the message content
 * @property {string} conversationId - Unique identifier for the conversation
 * @property {MessageDeliveryStatus} deliveryStatus - Current delivery status of the message ("unpublished" | "published" | "failed")
 * @property {string} [fallback] - Optional fallback text for the message
 * @property {number} [compression] - Optional compression level applied to the message
 * @property {string} id - Unique identifier for the message
 * @property {MessageKind} kind - Type of message ("application" | "membership_change")
 * @property {Record<string, string>} parameters - Additional parameters associated with the message
 * @property {string} senderInboxId - Identifier for the sender's inbox
 * @property {Date} sentAt - Timestamp when the message was sent
 * @property {number} sentAtNs - Timestamp when the message was sent (in nanoseconds)
 */
class DecodedMessage {
    #client;
    content;
    contentType;
    conversationId;
    deliveryStatus;
    fallback;
    compression;
    id;
    kind;
    parameters;
    senderInboxId;
    sentAt;
    sentAtNs;
    constructor(client, message) {
        this.#client = client;
        this.id = message.id;
        this.sentAtNs = message.sentAtNs;
        this.sentAt = nsToDate(message.sentAtNs);
        this.conversationId = message.convoId;
        this.senderInboxId = message.senderInboxId;
        switch (message.kind) {
            case 0 /* GroupMessageKind.Application */:
                this.kind = "application";
                break;
            case 1 /* GroupMessageKind.MembershipChange */:
                this.kind = "membership_change";
                break;
            // no default
        }
        switch (message.deliveryStatus) {
            case 0 /* DeliveryStatus.Unpublished */:
                this.deliveryStatus = "unpublished";
                break;
            case 1 /* DeliveryStatus.Published */:
                this.deliveryStatus = "published";
                break;
            case 2 /* DeliveryStatus.Failed */:
                this.deliveryStatus = "failed";
                break;
            // no default
        }
        this.contentType = message.content.type
            ? new ContentTypeId(message.content.type)
            : undefined;
        this.parameters = message.content.parameters;
        this.fallback = message.content.fallback;
        this.compression = message.content.compression;
        this.content = undefined;
        if (this.contentType) {
            try {
                this.content = this.#client.decodeContent(message, this.contentType);
            }
            catch {
                this.content = undefined;
            }
        }
    }
}

class CodecNotFoundError extends Error {
    constructor(contentType) {
        super(`Codec not found for "${contentType.toString()}" content type`);
    }
}
class InboxReassignError extends Error {
    constructor() {
        super("Unable to create add account signature text, `allowInboxReassign` must be true");
    }
}
class AccountAlreadyAssociatedError extends Error {
    constructor(inboxId) {
        super(`Account already associated with inbox ${inboxId}`);
    }
}
class GenerateSignatureError extends Error {
    constructor(signatureType) {
        let type = "";
        switch (signatureType) {
            case 0 /* SignatureRequestType.AddWallet */:
                type = "add account";
                break;
            case 1 /* SignatureRequestType.CreateInbox */:
                type = "create inbox";
                break;
            case 2 /* SignatureRequestType.RevokeWallet */:
                type = "remove account";
                break;
            case 3 /* SignatureRequestType.RevokeInstallations */:
                type = "revoke installations";
                break;
            case 4 /* SignatureRequestType.ChangeRecoveryIdentifier */:
                type = "change recovery identifier";
                break;
        }
        super(`Failed to generate ${type} signature text`);
    }
}
class InvalidGroupMembershipChangeError extends Error {
    constructor(messageId) {
        super(`Invalid group membership change for message ${messageId}`);
    }
}
class MissingContentTypeError extends Error {
    constructor() {
        super("Content type is required when sending content other than text");
    }
}
class SignerUnavailableError extends Error {
    constructor() {
        super("Signer unavailable, use Client.create to create a client with a signer");
    }
}
class ClientNotInitializedError extends Error {
    constructor() {
        super("Client not initialized, use Client.create or Client.build to create a client");
    }
}

/**
 * Represents a conversation
 *
 * This class is not intended to be initialized directly.
 */
class Conversation {
    #client;
    #conversation;
    #lastMessage;
    /**
     * Creates a new conversation instance
     *
     * @param client - The client instance managing the conversation
     * @param conversation - The underlying conversation instance
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client, conversation, lastMessage) {
        this.#client = client;
        this.#conversation = conversation;
        this.#lastMessage = lastMessage
            ? new DecodedMessage(client, lastMessage)
            : undefined;
    }
    /**
     * Gets the unique identifier for this conversation
     */
    get id() {
        return this.#conversation.id();
    }
    /**
     * Gets whether this conversation is currently active
     */
    get isActive() {
        return this.#conversation.isActive();
    }
    /**
     * Gets the inbox ID that added this client's inbox to the conversation
     */
    get addedByInboxId() {
        return this.#conversation.addedByInboxId();
    }
    /**
     * Gets the timestamp when the conversation was created in nanoseconds
     */
    get createdAtNs() {
        return this.#conversation.createdAtNs();
    }
    /**
     * Gets the date when the conversation was created
     */
    get createdAt() {
        return nsToDate(this.createdAtNs);
    }
    /**
     * Gets the metadata for this conversation
     *
     * @returns Promise that resolves with the conversation metadata
     */
    async metadata() {
        const metadata = await this.#conversation.groupMetadata();
        return {
            creatorInboxId: metadata.creatorInboxId(),
            conversationType: metadata.conversationType(),
        };
    }
    /**
     * Gets the members of this conversation
     *
     * @returns Promise that resolves with the conversation members
     */
    async members() {
        return this.#conversation.listMembers();
    }
    /**
     * Synchronizes conversation data from the network
     *
     * @returns Promise that resolves when synchronization is complete
     */
    async sync() {
        return this.#conversation.sync();
    }
    /**
     * Creates a stream for new messages in this conversation
     *
     * @param callback - Optional callback function for handling new stream values
     * @returns Stream instance for new messages
     */
    stream(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversation.stream((error, value) => {
            let err = error;
            let message;
            if (value) {
                try {
                    message = new DecodedMessage(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, message);
            callback?.(err, message);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Publishes pending messages that were sent optimistically
     *
     * @returns Promise that resolves when publishing is complete
     */
    async publishMessages() {
        return this.#conversation.publishMessages();
    }
    /**
     * Prepares a message to be published
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    sendOptimistic(content, contentType) {
        if (typeof content !== "string" && !contentType) {
            throw new MissingContentTypeError();
        }
        const encodedContent = typeof content === "string"
            ? this.#client.encodeContent(content, contentType ?? ContentTypeText)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.#client.encodeContent(content, contentType);
        return this.#conversation.sendOptimistic(encodedContent);
    }
    /**
     * Publishes a new message
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID after it has been sent
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    async send(content, contentType) {
        if (typeof content !== "string" && !contentType) {
            throw new MissingContentTypeError();
        }
        const encodedContent = typeof content === "string"
            ? this.#client.encodeContent(content, contentType ?? ContentTypeText)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.#client.encodeContent(content, contentType);
        return this.#conversation.send(encodedContent);
    }
    /**
     * Lists messages in this conversation
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of decoded messages
     */
    async messages(options) {
        const messages = await this.#conversation.findMessages(options);
        return messages.map((message) => new DecodedMessage(this.#client, message));
    }
    /**
     * Gets the last message in this conversation
     *
     * @returns Promise that resolves with the last message or undefined if none exists
     */
    async lastMessage() {
        return this.#lastMessage ?? (await this.messages({ limit: 1 }))[0];
    }
    /**
     * Gets the consent state for this conversation
     */
    get consentState() {
        return this.#conversation.consentState();
    }
    /**
     * Updates the consent state for this conversation
     *
     * @param consentState - The new consent state to set
     */
    updateConsentState(consentState) {
        this.#conversation.updateConsentState(consentState);
    }
    /**
     * Gets the message disappearing settings for this conversation
     *
     * @returns The current message disappearing settings or undefined if not set
     */
    messageDisappearingSettings() {
        return this.#conversation.messageDisappearingSettings() ?? undefined;
    }
    /**
     * Updates message disappearing settings for this conversation
     *
     * @param fromNs - The timestamp from which messages should start disappearing
     * @param inNs - The duration after which messages should disappear
     * @returns Promise that resolves when the update is complete
     */
    async updateMessageDisappearingSettings(fromNs, inNs) {
        return this.#conversation.updateMessageDisappearingSettings({
            fromNs,
            inNs,
        });
    }
    /**
     * Removes message disappearing settings from this conversation
     *
     * @returns Promise that resolves when the settings are removed
     */
    async removeMessageDisappearingSettings() {
        return this.#conversation.removeMessageDisappearingSettings();
    }
    /**
     * Checks if message disappearing is enabled for this conversation
     *
     * @returns Whether message disappearing is enabled
     */
    isMessageDisappearingEnabled() {
        return this.#conversation.isMessageDisappearingEnabled();
    }
    pausedForVersion() {
        return this.#conversation.pausedForVersion() ?? undefined;
    }
    /**
     * Retrieves HMAC keys for this conversation
     *
     * @returns The HMAC keys for this conversation
     */
    getHmacKeys() {
        return this.#conversation.getHmacKeys();
    }
}

/**
 * Represents a direct message conversation between two inboxes
 *
 * This class is not intended to be initialized directly.
 */
class Dm extends Conversation {
    #conversation;
    /**
     * Creates a new direct message conversation instance
     *
     * @param client - The client instance managing this direct message conversation
     * @param conversation - The underlying conversation instance
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client, conversation, lastMessage) {
        super(client, conversation, lastMessage);
        this.#conversation = conversation;
    }
    /**
     * Retrieves the inbox ID of the other participant in the DM
     *
     * @returns Promise that resolves with the peer's inbox ID
     */
    get peerInboxId() {
        return this.#conversation.dmPeerInboxId();
    }
}

/**
 * Represents a group conversation between multiple inboxes
 *
 * This class is not intended to be initialized directly.
 */
class Group extends Conversation {
    #conversation;
    /**
     * Creates a new group conversation instance
     *
     * @param client - The client instance managing this group conversation
     * @param conversation - The underlying conversation object
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client, conversation, lastMessage) {
        super(client, conversation, lastMessage);
        this.#conversation = conversation;
    }
    /**
     * The name of the group
     */
    get name() {
        return this.#conversation.groupName();
    }
    /**
     * Updates the group's name
     *
     * @param name The new name for the group
     */
    async updateName(name) {
        return this.#conversation.updateGroupName(name);
    }
    /**
     * The image URL of the group
     */
    get imageUrl() {
        return this.#conversation.groupImageUrlSquare();
    }
    /**
     * Updates the group's image URL
     *
     * @param imageUrl The new image URL for the group
     */
    async updateImageUrl(imageUrl) {
        return this.#conversation.updateGroupImageUrlSquare(imageUrl);
    }
    /**
     * The description of the group
     */
    get description() {
        return this.#conversation.groupDescription();
    }
    /**
     * Updates the group's description
     *
     * @param description The new description for the group
     */
    async updateDescription(description) {
        return this.#conversation.updateGroupDescription(description);
    }
    /**
     * The permissions of the group
     */
    get permissions() {
        const permissions = this.#conversation.groupPermissions();
        return {
            policyType: permissions.policyType(),
            policySet: permissions.policySet(),
        };
    }
    /**
     * Updates a specific permission policy for the group
     *
     * @param permissionType The type of permission to update
     * @param policy The new permission policy
     * @param metadataField Optional metadata field for the permission
     */
    async updatePermission(permissionType, policy, metadataField) {
        return this.#conversation.updatePermissionPolicy(permissionType, policy, metadataField);
    }
    /**
     * The list of admins of the group
     */
    get admins() {
        return this.#conversation.adminList();
    }
    /**
     * The list of super admins of the group
     */
    get superAdmins() {
        return this.#conversation.superAdminList();
    }
    /**
     * Checks if an inbox is an admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is an admin
     */
    isAdmin(inboxId) {
        return this.#conversation.isAdmin(inboxId);
    }
    /**
     * Checks if an inbox is a super admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is a super admin
     */
    isSuperAdmin(inboxId) {
        return this.#conversation.isSuperAdmin(inboxId);
    }
    /**
     * Adds members to the group using identifiers
     *
     * @param identifiers Array of member identifiers to add
     */
    async addMembersByIdentifiers(identifiers) {
        return this.#conversation.addMembers(identifiers);
    }
    /**
     * Adds members to the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to add
     */
    async addMembers(inboxIds) {
        return this.#conversation.addMembersByInboxId(inboxIds);
    }
    /**
     * Removes members from the group using identifiers
     *
     * @param identifiers Array of member identifiers to remove
     */
    async removeMembersByIdentifiers(identifiers) {
        return this.#conversation.removeMembers(identifiers);
    }
    /**
     * Removes members from the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to remove
     */
    async removeMembers(inboxIds) {
        return this.#conversation.removeMembersByInboxId(inboxIds);
    }
    /**
     * Promotes a group member to admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    async addAdmin(inboxId) {
        return this.#conversation.addAdmin(inboxId);
    }
    /**
     * Removes admin status from a group member
     *
     * @param inboxId The inbox ID of the admin to demote
     */
    async removeAdmin(inboxId) {
        return this.#conversation.removeAdmin(inboxId);
    }
    /**
     * Promotes a group member to super admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    async addSuperAdmin(inboxId) {
        return this.#conversation.addSuperAdmin(inboxId);
    }
    /**
     * Removes super admin status from a group member
     *
     * @param inboxId The inbox ID of the super admin to demote
     */
    async removeSuperAdmin(inboxId) {
        return this.#conversation.removeSuperAdmin(inboxId);
    }
}

/**
 * Manages conversations
 *
 * This class is not intended to be initialized directly.
 */
class Conversations {
    #client;
    #conversations;
    /**
     * Creates a new conversations instance
     *
     * @param client - The client instance managing the conversations
     * @param conversations - The underlying conversations instance
     */
    constructor(client, conversations) {
        this.#client = client;
        this.#conversations = conversations;
    }
    /**
     * Retrieves a conversation by its ID
     *
     * @param id - The conversation ID to look up
     * @returns The conversation if found, undefined otherwise
     */
    async getConversationById(id) {
        try {
            // findGroupById will throw if group is not found
            const group = this.#conversations.findGroupById(id);
            const metadata = await group.groupMetadata();
            return metadata.conversationType() === "group"
                ? new Group(this.#client, group)
                : new Dm(this.#client, group);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Retrieves a DM by inbox ID
     *
     * @param inboxId - The inbox ID to look up
     * @returns The DM if found, undefined otherwise
     */
    getDmByInboxId(inboxId) {
        try {
            // findDmByTargetInboxId will throw if group is not found
            const group = this.#conversations.findDmByTargetInboxId(inboxId);
            return new Dm(this.#client, group);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Retrieves a message by its ID
     *
     * @param id - The message ID to look up
     * @returns The decoded message if found, undefined otherwise
     */
    getMessageById(id) {
        try {
            // findMessageById will throw if message is not found
            const message = this.#conversations.findMessageById(id);
            return new DecodedMessage(this.#client, message);
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates a new group conversation with the specified identifiers
     *
     * @param identifiers - Array of identifiers for group members
     * @param options - Optional group creation options
     * @returns The new group
     */
    async newGroupWithIdentifiers(identifiers, options) {
        const group = await this.#conversations.createGroup(identifiers, options);
        const conversation = new Group(this.#client, group);
        return conversation;
    }
    /**
     * Creates a new group conversation with the specified inbox IDs
     *
     * @param inboxIds - Array of inbox IDs for group members
     * @param options - Optional group creation options
     * @returns The new group
     */
    async newGroup(inboxIds, options) {
        const group = await this.#conversations.createGroupByInboxId(inboxIds, options);
        const conversation = new Group(this.#client, group);
        return conversation;
    }
    /**
     * Creates a new DM conversation with the specified identifier
     *
     * @param identifier - Identifier for the DM recipient
     * @param options - Optional DM creation options
     * @returns The new DM
     */
    async newDmWithIdentifier(identifier, options) {
        const group = await this.#conversations.createDm(identifier, options);
        const conversation = new Dm(this.#client, group);
        return conversation;
    }
    /**
     * Creates a new DM conversation with the specified inbox ID
     *
     * @param inboxId - Inbox ID for the DM recipient
     * @param options - Optional DM creation options
     * @returns The new DM
     */
    async newDm(inboxId, options) {
        const group = await this.#conversations.createDmByInboxId(inboxId, options);
        const conversation = new Dm(this.#client, group);
        return conversation;
    }
    /**
     * Lists all conversations with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of conversations
     */
    async list(options) {
        const groups = this.#conversations.list(options);
        const conversations = await Promise.all(groups.map(async (item) => {
            const metadata = await item.conversation.groupMetadata();
            const conversationType = metadata.conversationType();
            switch (conversationType) {
                case "dm":
                    return new Dm(this.#client, item.conversation, item.lastMessage);
                case "group":
                    return new Group(this.#client, item.conversation, item.lastMessage);
                default:
                    return undefined;
            }
        }));
        return conversations.filter((conversation) => conversation !== undefined);
    }
    /**
     * Lists all groups with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of groups
     */
    listGroups(options) {
        const groups = this.#conversations.listGroups(options);
        return groups.map((item) => {
            const conversation = new Group(this.#client, item.conversation, item.lastMessage);
            return conversation;
        });
    }
    /**
     * Lists all DMs with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of DMs
     */
    listDms(options) {
        const groups = this.#conversations.listDms(options);
        return groups.map((item) => {
            const conversation = new Dm(this.#client, item.conversation, item.lastMessage);
            return conversation;
        });
    }
    /**
     * Synchronizes conversations for the current client from the network
     *
     * @returns Promise that resolves when sync is complete
     */
    async sync() {
        return this.#conversations.sync();
    }
    /**
     * Synchronizes all conversations and messages from the network with optional
     * consent state filtering
     *
     * @param consentStates - Optional array of consent states to filter by
     * @returns Promise that resolves when sync is complete
     */
    async syncAll(consentStates) {
        return this.#conversations.syncAllConversations(consentStates);
    }
    /**
     * Creates a stream for new conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new conversations
     */
    stream(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.stream((err, value) => {
            if (err) {
                asyncStream.callback(err, undefined);
                callback?.(err, undefined);
                return;
            }
            value
                ?.groupMetadata()
                .then((metadata) => {
                const conversation = metadata.conversationType() === "dm"
                    ? new Dm(this.#client, value)
                    : new Group(this.#client, value);
                asyncStream.callback(null, conversation);
                callback?.(null, conversation);
            })
                .catch((error) => {
                asyncStream.callback(error, undefined);
                callback?.(error, undefined);
            });
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream for new group conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new group conversations
     */
    streamGroups(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamGroups((error, value) => {
            let err = error;
            let group;
            if (value) {
                try {
                    group = new Group(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, group);
            callback?.(err, group);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream for new DM conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new DM conversations
     */
    streamDms(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamDms((error, value) => {
            let err = error;
            let dm;
            if (value) {
                try {
                    dm = new Dm(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, dm);
            callback?.(err, dm);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream for all new messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new messages
     */
    async streamAllMessages(callback) {
        // sync conversations first
        await this.sync();
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamAllMessages((error, value) => {
            let err = error;
            let message;
            if (value) {
                try {
                    message = new DecodedMessage(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, message);
            callback?.(err, message);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream for all new group messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new group messages
     */
    async streamAllGroupMessages(callback) {
        // sync conversations first
        await this.sync();
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamAllGroupMessages((error, value) => {
            let err = error;
            let message;
            if (value) {
                try {
                    message = new DecodedMessage(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, message);
            callback?.(err, message);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream for all new DM messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new DM messages
     */
    async streamAllDmMessages(callback) {
        // sync conversations first
        await this.sync();
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamAllDmMessages((error, value) => {
            let err = error;
            let message;
            if (value) {
                try {
                    message = new DecodedMessage(this.#client, value);
                }
                catch (error) {
                    err = error;
                }
            }
            asyncStream.callback(err, message);
            callback?.(err, message);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Retrieves HMAC keys for all conversations
     *
     * @returns The HMAC keys for all conversations
     */
    hmacKeys() {
        return this.#conversations.getHmacKeys();
    }
}

/**
 * Manages user preferences and consent states
 *
 * This class is not intended to be initialized directly.
 */
class Preferences {
    #client;
    #conversations;
    /**
     * Creates a new preferences instance
     *
     * @param client - The client instance managing preferences
     * @param conversations - The underlying conversations instance
     */
    constructor(client, conversations) {
        this.#client = client;
        this.#conversations = conversations;
    }
    /**
     * Retrieves the current inbox state
     *
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state
     */
    async inboxState(refreshFromNetwork = false) {
        return this.#client.inboxState(refreshFromNetwork);
    }
    /**
     * Gets the latest inbox state for a specific inbox
     *
     * @param inboxId - The inbox ID to get state for
     * @returns Promise that resolves with the latest inbox state
     */
    async getLatestInboxState(inboxId) {
        return this.#client.getLatestInboxState(inboxId);
    }
    /**
     * Retrieves inbox state for specific inbox IDs
     *
     * @param inboxIds - Array of inbox IDs to get state for
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state for the inbox IDs
     */
    async inboxStateFromInboxIds(inboxIds, refreshFromNetwork) {
        return this.#client.addressesFromInboxId(refreshFromNetwork ?? false, inboxIds);
    }
    /**
     * Updates consent states for multiple records
     *
     * @param consentStates - Array of consent records to update
     * @returns Promise that resolves when consent states are updated
     */
    async setConsentStates(consentStates) {
        return this.#client.setConsentStates(consentStates);
    }
    /**
     * Retrieves consent state for a specific entity
     *
     * @param entityType - Type of entity to get consent for
     * @param entity - Entity identifier
     * @returns Promise that resolves with the consent state
     */
    async getConsentState(entityType, entity) {
        return this.#client.getConsentState(entityType, entity);
    }
    /**
     * Creates a stream of consent state updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for consent updates
     */
    streamConsent(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamConsent((err, value) => {
            if (err) {
                asyncStream.callback(err, undefined);
                callback?.(err, undefined);
                return;
            }
            asyncStream.callback(null, value);
            callback?.(null, value);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
    /**
     * Creates a stream of user preference updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for preference updates
     */
    streamPreferences(callback) {
        const asyncStream = new AsyncStream();
        const stream = this.#conversations.streamPreferences((err, value) => {
            if (err) {
                asyncStream.callback(err, undefined);
                callback?.(err, undefined);
                return;
            }
            // TODO: remove this once the node bindings type is updated
            asyncStream.callback(null, value);
            callback?.(null, value);
        });
        asyncStream.onReturn = stream.end.bind(stream);
        return asyncStream;
    }
}

const generateInboxId = (identifier) => {
    return generateInboxId$1(identifier);
};
const getInboxIdForIdentifier = async (identifier, env = "dev") => {
    const host = ApiUrls[env];
    const isSecure = host.startsWith("https");
    return getInboxIdForIdentifier$1(host, isSecure, identifier);
};

const createClient = async (identifier, options) => {
    const env = options?.env || "dev";
    const host = options?.apiUrl || ApiUrls[env];
    const isSecure = host.startsWith("https");
    const inboxId = (await getInboxIdForIdentifier(identifier, env)) ||
        generateInboxId(identifier);
    const dbPath = options?.dbPath === undefined
        ? join(process.cwd(), `xmtp-${env}-${inboxId}.db3`)
        : options.dbPath;
    const logOptions = {
        structured: options?.structuredLogging ?? false,
        level: options?.loggingLevel ?? "off" /* LogLevel.off */,
    };
    const historySyncUrl = options?.historySyncUrl || HistorySyncUrls[env];
    return createClient$1(host, isSecure, dbPath, inboxId, identifier, options?.dbEncryptionKey, historySyncUrl, logOptions);
};

const version = `${bindingsVersion.branch}@${bindingsVersion.version} (${bindingsVersion.date})`;

/**
 * Client for interacting with the XMTP network
 */
class Client {
    #client;
    #conversations;
    #preferences;
    #signer;
    #codecs;
    #identifier;
    #options;
    /**
     * Creates a new XMTP client instance
     *
     * This class is not intended to be initialized directly.
     * Use `Client.create` or `Client.build` instead.
     *
     * @param options - Optional configuration for the client
     */
    constructor(options) {
        this.#options = options;
        const codecs = [
            new GroupUpdatedCodec(),
            new TextCodec(),
            ...(options?.codecs ?? []),
        ];
        this.#codecs = new Map(codecs.map((codec) => [codec.contentType.toString(), codec]));
    }
    /**
     * Initializes the client with the provided identifier
     *
     * This is not meant to be called directly.
     * Use `Client.create` or `Client.build` instead.
     *
     * @param identifier - The identifier to initialize the client with
     */
    async init(identifier) {
        if (this.#client) {
            return;
        }
        this.#identifier = identifier;
        this.#client = await createClient(identifier, this.#options);
        const conversations = this.#client.conversations();
        this.#conversations = new Conversations(this, conversations);
        this.#preferences = new Preferences(this.#client, conversations);
    }
    /**
     * Creates a new client instance with a signer
     *
     * @param signer - The signer to use for authentication
     * @param options - Optional configuration for the client
     * @returns A new client instance
     */
    static async create(signer, options) {
        const identifier = await signer.getIdentifier();
        const client = new Client(options);
        client.#signer = signer;
        await client.init(identifier);
        if (!options?.disableAutoRegister) {
            await client.register();
        }
        return client;
    }
    /**
     * Creates a new client instance with an identifier
     *
     * Clients created with this method must already be registered.
     * Any methods called that require a signer will throw an error.
     *
     * @param identifier - The identifier to use
     * @param options - Optional configuration for the client
     * @returns A new client instance
     */
    static async build(identifier, options) {
        const client = new Client({
            ...options,
            disableAutoRegister: true,
        });
        await client.init(identifier);
        return client;
    }
    /**
     * Gets the client options
     */
    get options() {
        return this.#options;
    }
    /**
     * Gets the signer associated with this client
     */
    get signer() {
        return this.#signer;
    }
    /**
     * Gets the account identifier for this client
     */
    get accountIdentifier() {
        return this.#identifier;
    }
    /**
     * Gets the inbox ID associated with this client
     */
    get inboxId() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.inboxId();
    }
    /**
     * Gets the installation ID for this client
     */
    get installationId() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.installationId();
    }
    /**
     * Gets the installation ID bytes for this client
     */
    get installationIdBytes() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.installationIdBytes();
    }
    /**
     * Gets whether the client is registered with the XMTP network
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get isRegistered() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.isRegistered();
    }
    /**
     * Gets the conversations manager for this client
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get conversations() {
        if (!this.#conversations) {
            throw new ClientNotInitializedError();
        }
        return this.#conversations;
    }
    /**
     * Gets the preferences manager for this client
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get preferences() {
        if (!this.#preferences) {
            throw new ClientNotInitializedError();
        }
        return this.#preferences;
    }
    /**
     * Creates signature text for creating a new inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `register` method instead.
     *
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_createInboxSignatureText() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            const signatureText = await this.#client.createInboxSignatureText();
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates signature text for adding a new account to the client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `unsafe_addAccount` method instead.
     *
     * The `allowInboxReassign` parameter must be true or this function will
     * throw an error.
     *
     * @param newAccountIdentifier - The identifier of the new account
     * @param allowInboxReassign - Whether to allow inbox reassignment
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_addAccountSignatureText(newAccountIdentifier, allowInboxReassign = false) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!allowInboxReassign) {
            throw new InboxReassignError();
        }
        try {
            const signatureText = await this.#client.addIdentifierSignatureText(newAccountIdentifier);
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates signature text for removing an account from the client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `removeAccount` method instead.
     *
     * @param identifier - The identifier of the account to remove
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_removeAccountSignatureText(identifier) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            const signatureText = await this.#client.revokeIdentifierSignatureText(identifier);
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates signature text for revoking all other installations of the
     * client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `revokeAllOtherInstallations` method instead.
     *
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_revokeAllOtherInstallationsSignatureText() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            const signatureText = await this.#client.revokeAllOtherInstallationsSignatureText();
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates signature text for revoking specific installations of the
     * client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `revokeInstallations` method instead.
     *
     * @param installationIds - The installation IDs to revoke
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_revokeInstallationsSignatureText(installationIds) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            const signatureText = await this.#client.revokeInstallationsSignatureText(installationIds);
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Creates signature text for changing the recovery identifier for this
     * client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `changeRecoveryIdentifier` method instead.
     *
     * @param identifier - The new recovery identifier
     * @returns The signature text
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_changeRecoveryIdentifierSignatureText(identifier) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            const signatureText = await this.#client.changeRecoveryIdentifierSignatureText(identifier);
            return signatureText;
        }
        catch {
            return undefined;
        }
    }
    /**
     * Adds a signature for a specific request type
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `register`, `unsafe_addAccount`,
     * `removeAccount`, `revokeAllOtherInstallations`, or `revokeInstallations`
     * methods instead.
     *
     * @param signatureType - The type of signature request
     * @param signatureText - The text to sign
     * @param signer - The signer to use
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_addSignature(signatureType, signatureText, signer) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        switch (signer.type) {
            case "SCW":
                await this.#client.addScwSignature(signatureType, await signer.signMessage(signatureText), signer.getChainId(), signer.getBlockNumber?.());
                break;
            case "EOA":
                await this.#client.addEcdsaSignature(signatureType, await signer.signMessage(signatureText));
                break;
        }
    }
    /**
     * Applies all pending signatures
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `register`, `unsafe_addAccount`,
     * `removeAccount`, `revokeAllOtherInstallations`, or `revokeInstallations`
     * methods instead.
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async unsafe_applySignatures() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.applySignatureRequests();
    }
    /**
     * Registers the client with the XMTP network
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {SignerUnavailableError} if no signer is available
     */
    async register() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!this.#signer) {
            throw new SignerUnavailableError();
        }
        const signatureText = await this.unsafe_createInboxSignatureText();
        // if the signature text is not available, the client is already registered
        if (!signatureText) {
            return;
        }
        await this.unsafe_addSignature(1 /* SignatureRequestType.CreateInbox */, signatureText, this.#signer);
        return this.#client.registerIdentity();
    }
    /**
     * Adds a new account to the client inbox
     *
     * WARNING: This function should be used with caution. Adding a wallet already
     * associated with an inbox ID will cause the wallet to lose access to
     * that inbox.
     *
     * The `allowInboxReassign` parameter must be true to reassign an inbox
     * already associated with a different account.
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @param newAccountSigner - The signer for the new account
     * @param allowInboxReassign - Whether to allow inbox reassignment
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {AccountAlreadyAssociatedError} if the account is already associated with an inbox ID
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    async unsafe_addAccount(newAccountSigner, allowInboxReassign = false) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        // check for existing inbox id
        const identifier = await newAccountSigner.getIdentifier();
        const existingInboxId = await this.getInboxIdByIdentifier(identifier);
        if (existingInboxId && !allowInboxReassign) {
            throw new AccountAlreadyAssociatedError(existingInboxId);
        }
        const signatureText = await this.unsafe_addAccountSignatureText(identifier, true);
        if (!signatureText) {
            throw new GenerateSignatureError(0 /* SignatureRequestType.AddWallet */);
        }
        await this.unsafe_addSignature(0 /* SignatureRequestType.AddWallet */, signatureText, newAccountSigner);
        await this.unsafe_applySignatures();
    }
    /**
     * Removes an account from the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @param identifier - The identifier of the account to remove
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    async removeAccount(identifier) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!this.#signer) {
            throw new SignerUnavailableError();
        }
        const signatureText = await this.unsafe_removeAccountSignatureText(identifier);
        if (!signatureText) {
            throw new GenerateSignatureError(2 /* SignatureRequestType.RevokeWallet */);
        }
        await this.unsafe_addSignature(2 /* SignatureRequestType.RevokeWallet */, signatureText, this.#signer);
        await this.unsafe_applySignatures();
    }
    /**
     * Revokes all other installations of the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    async revokeAllOtherInstallations() {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!this.#signer) {
            throw new SignerUnavailableError();
        }
        const signatureText = await this.unsafe_revokeAllOtherInstallationsSignatureText();
        if (!signatureText) {
            throw new GenerateSignatureError(3 /* SignatureRequestType.RevokeInstallations */);
        }
        await this.unsafe_addSignature(3 /* SignatureRequestType.RevokeInstallations */, signatureText, this.#signer);
        await this.unsafe_applySignatures();
    }
    /**
     * Revokes specific installations of the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @param installationIds - The installation IDs to revoke
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {SignerUnavailableError} if no signer is available
     * @throws {GenerateSignatureError} if the signature cannot be generated
     */
    async revokeInstallations(installationIds) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!this.#signer) {
            throw new SignerUnavailableError();
        }
        const signatureText = await this.unsafe_revokeInstallationsSignatureText(installationIds);
        if (!signatureText) {
            throw new GenerateSignatureError(3 /* SignatureRequestType.RevokeInstallations */);
        }
        await this.unsafe_addSignature(3 /* SignatureRequestType.RevokeInstallations */, signatureText, this.#signer);
        await this.unsafe_applySignatures();
    }
    /**
     * Changes the recovery identifier for the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @param identifier - The new recovery identifier
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {SignerUnavailableError} if no signer is available
     * @throws {GenerateSignatureError} if the signature cannot be generated
     */
    async changeRecoveryIdentifier(identifier) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        if (!this.#signer) {
            throw new SignerUnavailableError();
        }
        const signatureText = await this.unsafe_changeRecoveryIdentifierSignatureText(identifier);
        if (!signatureText) {
            throw new GenerateSignatureError(4 /* SignatureRequestType.ChangeRecoveryIdentifier */);
        }
        await this.unsafe_addSignature(4 /* SignatureRequestType.ChangeRecoveryIdentifier */, signatureText, this.#signer);
        await this.unsafe_applySignatures();
    }
    /**
     * Checks if the client can message the specified identifiers
     *
     * @param identifiers - The identifiers to check
     * @returns Whether the client can message the identifiers
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async canMessage(identifiers) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        const canMessage = await this.#client.canMessage(identifiers);
        return new Map(Object.entries(canMessage));
    }
    /**
     * Checks if the specified identifiers can be messaged
     *
     * @param identifiers - The identifiers to check
     * @param env - Optional XMTP environment
     * @returns Map of identifiers to whether they can be messaged
     */
    static async canMessage(identifiers, env) {
        const canMessageMap = new Map();
        for (const identifier of identifiers) {
            const inboxId = await getInboxIdForIdentifier(identifier, env);
            canMessageMap.set(identifier.identifier.toLowerCase(), inboxId !== null);
        }
        return canMessageMap;
    }
    /**
     * Gets the key package statuses for the specified installation IDs
     *
     * @param installationIds - The installation IDs to check
     * @returns The key package statuses
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async getKeyPackageStatusesForInstallationIds(installationIds) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.getKeyPackageStatusesForInstallationIds(installationIds);
    }
    /**
     * Gets the codec for a given content type
     *
     * @param contentType - The content type to get the codec for
     * @returns The codec, if found
     */
    codecFor(contentType) {
        return this.#codecs.get(contentType.toString());
    }
    /**
     * Encodes content for a given content type
     *
     * @param content - The content to encode
     * @param contentType - The content type to encode for
     * @returns The encoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     */
    encodeContent(content, contentType) {
        const codec = this.codecFor(contentType);
        if (!codec) {
            throw new CodecNotFoundError(contentType);
        }
        const encoded = codec.encode(content, this);
        const fallback = codec.fallback(content);
        if (fallback) {
            encoded.fallback = fallback;
        }
        return encoded;
    }
    /**
     * Decodes a message for a given content type
     *
     * @param message - The message to decode
     * @param contentType - The content type to decode for
     * @returns The decoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     * @throws {InvalidGroupMembershipChangeError} if the message is an invalid group membership change
     */
    decodeContent(message, contentType) {
        const codec = this.codecFor(contentType);
        if (!codec) {
            throw new CodecNotFoundError(contentType);
        }
        // throw an error if there's an invalid group membership change message
        if (contentType.sameAs(ContentTypeGroupUpdated) &&
            message.kind !== 1 /* GroupMessageKind.MembershipChange */) {
            throw new InvalidGroupMembershipChangeError(message.id);
        }
        return codec.decode(message.content, this);
    }
    /**
     * Finds the inbox ID for a given identifier
     *
     * @param identifier - The identifier to look up
     * @returns The inbox ID, if found
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    async getInboxIdByIdentifier(identifier) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.findInboxIdByIdentifier(identifier);
    }
    /**
     * Signs a message with the installation key
     *
     * @param signatureText - The text to sign
     * @returns The signature
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    signWithInstallationKey(signatureText) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        return this.#client.signWithInstallationKey(signatureText);
    }
    /**
     * Verifies a signature was made with the installation key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @returns Whether the signature is valid
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    verifySignedWithInstallationKey(signatureText, signatureBytes) {
        if (!this.#client) {
            throw new ClientNotInitializedError();
        }
        try {
            this.#client.verifySignedWithInstallationKey(signatureText, signatureBytes);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Verifies a signature was made with a public key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @param publicKey - The public key to verify against
     * @returns Whether the signature is valid
     */
    static verifySignedWithPublicKey(signatureText, signatureBytes, publicKey) {
        try {
            verifySignedWithPublicKey(signatureText, signatureBytes, publicKey);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Checks if an address is authorized for an inbox
     *
     * @param inboxId - The inbox ID to check
     * @param address - The address to check
     * @param options - Optional network options
     * @returns Whether the address is authorized
     */
    static async isAddressAuthorized(inboxId, address, options) {
        const host = options?.apiUrl || ApiUrls[options?.env || "dev"];
        return await isAddressAuthorized(host, inboxId, address);
    }
    /**
     * Checks if an installation is authorized for an inbox
     *
     * @param inboxId - The inbox ID to check
     * @param installation - The installation to check
     * @param options - Optional network options
     * @returns Whether the installation is authorized
     */
    static async isInstallationAuthorized(inboxId, installation, options) {
        const host = options?.apiUrl || ApiUrls[options?.env || "dev"];
        return await isInstallationAuthorized(host, inboxId, installation);
    }
    /**
     * Gets the version of the Node bindings
     */
    static get version() {
        return version;
    }
}

export { ApiUrls, Client, Conversation, Conversations, DecodedMessage, Dm, Group, HistorySyncUrls, generateInboxId, getInboxIdForIdentifier };
//# sourceMappingURL=index.js.map
