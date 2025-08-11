import { ContentCodec, ContentTypeId, EncodedContent } from '@xmtp/content-type-primitives';
import * as _xmtp_node_bindings from '@xmtp/node-bindings';
import { LogLevel, Message, Conversation as Conversation$1, ListMessagesOptions, ConsentState, PermissionUpdateType, PermissionPolicy, MetadataField, Identifier, Conversations as Conversations$1, CreateGroupOptions, CreateDmOptions, ListConversationsOptions, Client as Client$1, Consent, ConsentEntityType, SignatureRequestType } from '@xmtp/node-bindings';
export { Consent, ConsentEntityType, ConsentState, ContentType, ContentTypeId, ConversationListItem, ConversationType, CreateDmOptions, CreateGroupOptions, DeliveryStatus, EncodedContent, GroupMember, GroupMembershipState, GroupMessageKind, GroupMetadata, GroupPermissions, GroupPermissionsOptions, HmacKey, Identifier, IdentifierKind, InboxState, Installation, KeyPackageStatus, Lifetime, ListConversationsOptions, ListMessagesOptions, LogLevel, LogOptions, Message, MessageDisappearingSettings, MetadataField, PermissionLevel, PermissionPolicy, PermissionPolicySet, PermissionUpdateType, SignatureRequestType, SortDirection } from '@xmtp/node-bindings';

/**
 * Pre-configured URLs for the XMTP network based on the environment
 *
 * @constant
 * @property {string} local - The local URL for the XMTP network
 * @property {string} dev - The development URL for the XMTP network
 * @property {string} production - The production URL for the XMTP network
 */
declare const ApiUrls: {
    readonly local: "http://localhost:5556";
    readonly dev: "https://grpc.dev.xmtp.network:443";
    readonly production: "https://grpc.production.xmtp.network:443";
};
/**
 * Pre-configured URLs for the XMTP history sync service based on the environment
 *
 * @constant
 * @property {string} local - The local URL for the XMTP history sync service
 * @property {string} dev - The development URL for the XMTP history sync service
 * @property {string} production - The production URL for the XMTP history sync service
 */
declare const HistorySyncUrls: {
    readonly local: "http://localhost:5558";
    readonly dev: "https://message-history.dev.ephemera.network";
    readonly production: "https://message-history.production.ephemera.network";
};

/**
 * XMTP environment
 */
type XmtpEnv = keyof typeof ApiUrls;
/**
 * Network options
 */
type NetworkOptions = {
    /**
     * Specify which XMTP environment to connect to. (default: `dev`)
     */
    env?: XmtpEnv;
    /**
     * apiUrl can be used to override the `env` flag and connect to a
     * specific endpoint
     */
    apiUrl?: string;
    /**
     * historySyncUrl can be used to override the `env` flag and connect to a
     * specific endpoint for syncing history
     */
    historySyncUrl?: string;
};
/**
 * Storage options
 */
type StorageOptions = {
    /**
     * Path to the local DB
     */
    dbPath?: string | null;
    /**
     * Encryption key for the local DB
     */
    dbEncryptionKey?: Uint8Array;
};
type ContentOptions = {
    /**
     * Allow configuring codecs for additional content types
     */
    codecs?: ContentCodec[];
};
type OtherOptions = {
    /**
     * Enable structured JSON logging
     */
    structuredLogging?: boolean;
    /**
     * Logging level
     */
    loggingLevel?: LogLevel;
    /**
     * Disable automatic registration when creating a client
     */
    disableAutoRegister?: boolean;
};
type ClientOptions = NetworkOptions & StorageOptions & ContentOptions & OtherOptions;

type ResolveValue<T> = {
    value: T | undefined;
    done: boolean;
};
type StreamCallback<T> = (err: Error | null, value: T | undefined) => void;
declare class AsyncStream<T> {
    #private;
    onReturn: (() => void) | undefined;
    onError: ((error: Error) => void) | undefined;
    constructor();
    get error(): Error | null;
    get isDone(): boolean;
    callback: StreamCallback<T>;
    next: () => Promise<ResolveValue<T>>;
    return: (value: T | undefined) => Promise<{
        done: boolean;
        value: T | undefined;
    }>;
    [Symbol.asyncIterator](): this;
}

type MessageKind = "application" | "membership_change";
type MessageDeliveryStatus = "unpublished" | "published" | "failed";
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
declare class DecodedMessage<T = unknown> {
    #private;
    content: T | undefined;
    contentType: ContentTypeId | undefined;
    conversationId: string;
    deliveryStatus: MessageDeliveryStatus;
    fallback?: string;
    compression?: number;
    id: string;
    kind: MessageKind;
    parameters: Record<string, string>;
    senderInboxId: string;
    sentAt: Date;
    sentAtNs: number;
    constructor(client: Client, message: Message);
}

/**
 * Represents a conversation
 *
 * This class is not intended to be initialized directly.
 */
declare class Conversation {
    #private;
    /**
     * Creates a new conversation instance
     *
     * @param client - The client instance managing the conversation
     * @param conversation - The underlying conversation instance
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client: Client, conversation: Conversation$1, lastMessage?: Message | null);
    /**
     * Gets the unique identifier for this conversation
     */
    get id(): string;
    /**
     * Gets whether this conversation is currently active
     */
    get isActive(): boolean;
    /**
     * Gets the inbox ID that added this client's inbox to the conversation
     */
    get addedByInboxId(): string;
    /**
     * Gets the timestamp when the conversation was created in nanoseconds
     */
    get createdAtNs(): number;
    /**
     * Gets the date when the conversation was created
     */
    get createdAt(): Date;
    /**
     * Gets the metadata for this conversation
     *
     * @returns Promise that resolves with the conversation metadata
     */
    metadata(): Promise<{
        creatorInboxId: string;
        conversationType: string;
    }>;
    /**
     * Gets the members of this conversation
     *
     * @returns Promise that resolves with the conversation members
     */
    members(): Promise<_xmtp_node_bindings.GroupMember[]>;
    /**
     * Synchronizes conversation data from the network
     *
     * @returns Promise that resolves when synchronization is complete
     */
    sync(): Promise<void>;
    /**
     * Creates a stream for new messages in this conversation
     *
     * @param callback - Optional callback function for handling new stream values
     * @returns Stream instance for new messages
     */
    stream(callback?: StreamCallback<DecodedMessage>): AsyncStream<DecodedMessage<unknown>>;
    /**
     * Publishes pending messages that were sent optimistically
     *
     * @returns Promise that resolves when publishing is complete
     */
    publishMessages(): Promise<void>;
    /**
     * Prepares a message to be published
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    sendOptimistic(content: unknown, contentType?: ContentTypeId): string;
    /**
     * Publishes a new message
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID after it has been sent
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    send(content: unknown, contentType?: ContentTypeId): Promise<string>;
    /**
     * Lists messages in this conversation
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of decoded messages
     */
    messages(options?: ListMessagesOptions): Promise<DecodedMessage[]>;
    /**
     * Gets the last message in this conversation
     *
     * @returns Promise that resolves with the last message or undefined if none exists
     */
    lastMessage(): Promise<DecodedMessage<unknown>>;
    /**
     * Gets the consent state for this conversation
     */
    get consentState(): ConsentState;
    /**
     * Updates the consent state for this conversation
     *
     * @param consentState - The new consent state to set
     */
    updateConsentState(consentState: ConsentState): void;
    /**
     * Gets the message disappearing settings for this conversation
     *
     * @returns The current message disappearing settings or undefined if not set
     */
    messageDisappearingSettings(): _xmtp_node_bindings.MessageDisappearingSettings | undefined;
    /**
     * Updates message disappearing settings for this conversation
     *
     * @param fromNs - The timestamp from which messages should start disappearing
     * @param inNs - The duration after which messages should disappear
     * @returns Promise that resolves when the update is complete
     */
    updateMessageDisappearingSettings(fromNs: number, inNs: number): Promise<void>;
    /**
     * Removes message disappearing settings from this conversation
     *
     * @returns Promise that resolves when the settings are removed
     */
    removeMessageDisappearingSettings(): Promise<void>;
    /**
     * Checks if message disappearing is enabled for this conversation
     *
     * @returns Whether message disappearing is enabled
     */
    isMessageDisappearingEnabled(): boolean;
    pausedForVersion(): string | undefined;
    /**
     * Retrieves HMAC keys for this conversation
     *
     * @returns The HMAC keys for this conversation
     */
    getHmacKeys(): _xmtp_node_bindings.HmacKey[];
}

/**
 * Represents a direct message conversation between two inboxes
 *
 * This class is not intended to be initialized directly.
 */
declare class Dm extends Conversation {
    #private;
    /**
     * Creates a new direct message conversation instance
     *
     * @param client - The client instance managing this direct message conversation
     * @param conversation - The underlying conversation instance
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client: Client, conversation: Conversation$1, lastMessage?: Message | null);
    /**
     * Retrieves the inbox ID of the other participant in the DM
     *
     * @returns Promise that resolves with the peer's inbox ID
     */
    get peerInboxId(): string;
}

/**
 * Represents a group conversation between multiple inboxes
 *
 * This class is not intended to be initialized directly.
 */
declare class Group extends Conversation {
    #private;
    /**
     * Creates a new group conversation instance
     *
     * @param client - The client instance managing this group conversation
     * @param conversation - The underlying conversation object
     * @param lastMessage - Optional last message in the conversation
     */
    constructor(client: Client, conversation: Conversation$1, lastMessage?: Message | null);
    /**
     * The name of the group
     */
    get name(): string;
    /**
     * Updates the group's name
     *
     * @param name The new name for the group
     */
    updateName(name: string): Promise<void>;
    /**
     * The image URL of the group
     */
    get imageUrl(): string;
    /**
     * Updates the group's image URL
     *
     * @param imageUrl The new image URL for the group
     */
    updateImageUrl(imageUrl: string): Promise<void>;
    /**
     * The description of the group
     */
    get description(): string;
    /**
     * Updates the group's description
     *
     * @param description The new description for the group
     */
    updateDescription(description: string): Promise<void>;
    /**
     * The permissions of the group
     */
    get permissions(): {
        policyType: _xmtp_node_bindings.GroupPermissionsOptions;
        policySet: _xmtp_node_bindings.PermissionPolicySet;
    };
    /**
     * Updates a specific permission policy for the group
     *
     * @param permissionType The type of permission to update
     * @param policy The new permission policy
     * @param metadataField Optional metadata field for the permission
     */
    updatePermission(permissionType: PermissionUpdateType, policy: PermissionPolicy, metadataField?: MetadataField): Promise<void>;
    /**
     * The list of admins of the group
     */
    get admins(): string[];
    /**
     * The list of super admins of the group
     */
    get superAdmins(): string[];
    /**
     * Checks if an inbox is an admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is an admin
     */
    isAdmin(inboxId: string): boolean;
    /**
     * Checks if an inbox is a super admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is a super admin
     */
    isSuperAdmin(inboxId: string): boolean;
    /**
     * Adds members to the group using identifiers
     *
     * @param identifiers Array of member identifiers to add
     */
    addMembersByIdentifiers(identifiers: Identifier[]): Promise<void>;
    /**
     * Adds members to the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to add
     */
    addMembers(inboxIds: string[]): Promise<void>;
    /**
     * Removes members from the group using identifiers
     *
     * @param identifiers Array of member identifiers to remove
     */
    removeMembersByIdentifiers(identifiers: Identifier[]): Promise<void>;
    /**
     * Removes members from the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to remove
     */
    removeMembers(inboxIds: string[]): Promise<void>;
    /**
     * Promotes a group member to admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    addAdmin(inboxId: string): Promise<void>;
    /**
     * Removes admin status from a group member
     *
     * @param inboxId The inbox ID of the admin to demote
     */
    removeAdmin(inboxId: string): Promise<void>;
    /**
     * Promotes a group member to super admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    addSuperAdmin(inboxId: string): Promise<void>;
    /**
     * Removes super admin status from a group member
     *
     * @param inboxId The inbox ID of the super admin to demote
     */
    removeSuperAdmin(inboxId: string): Promise<void>;
}

/**
 * Manages conversations
 *
 * This class is not intended to be initialized directly.
 */
declare class Conversations {
    #private;
    /**
     * Creates a new conversations instance
     *
     * @param client - The client instance managing the conversations
     * @param conversations - The underlying conversations instance
     */
    constructor(client: Client, conversations: Conversations$1);
    /**
     * Retrieves a conversation by its ID
     *
     * @param id - The conversation ID to look up
     * @returns The conversation if found, undefined otherwise
     */
    getConversationById(id: string): Promise<Dm | Group | undefined>;
    /**
     * Retrieves a DM by inbox ID
     *
     * @param inboxId - The inbox ID to look up
     * @returns The DM if found, undefined otherwise
     */
    getDmByInboxId(inboxId: string): Dm | undefined;
    /**
     * Retrieves a message by its ID
     *
     * @param id - The message ID to look up
     * @returns The decoded message if found, undefined otherwise
     */
    getMessageById<T = unknown>(id: string): DecodedMessage<T> | undefined;
    /**
     * Creates a new group conversation with the specified identifiers
     *
     * @param identifiers - Array of identifiers for group members
     * @param options - Optional group creation options
     * @returns The new group
     */
    newGroupWithIdentifiers(identifiers: Identifier[], options?: CreateGroupOptions): Promise<Group>;
    /**
     * Creates a new group conversation with the specified inbox IDs
     *
     * @param inboxIds - Array of inbox IDs for group members
     * @param options - Optional group creation options
     * @returns The new group
     */
    newGroup(inboxIds: string[], options?: CreateGroupOptions): Promise<Group>;
    /**
     * Creates a new DM conversation with the specified identifier
     *
     * @param identifier - Identifier for the DM recipient
     * @param options - Optional DM creation options
     * @returns The new DM
     */
    newDmWithIdentifier(identifier: Identifier, options?: CreateDmOptions): Promise<Dm>;
    /**
     * Creates a new DM conversation with the specified inbox ID
     *
     * @param inboxId - Inbox ID for the DM recipient
     * @param options - Optional DM creation options
     * @returns The new DM
     */
    newDm(inboxId: string, options?: CreateDmOptions): Promise<Dm>;
    /**
     * Lists all conversations with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of conversations
     */
    list(options?: ListConversationsOptions): Promise<(Dm | Group)[]>;
    /**
     * Lists all groups with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of groups
     */
    listGroups(options?: Omit<ListConversationsOptions, "conversationType">): Group[];
    /**
     * Lists all DMs with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Array of DMs
     */
    listDms(options?: Omit<ListConversationsOptions, "conversationType">): Dm[];
    /**
     * Synchronizes conversations for the current client from the network
     *
     * @returns Promise that resolves when sync is complete
     */
    sync(): Promise<void>;
    /**
     * Synchronizes all conversations and messages from the network with optional
     * consent state filtering
     *
     * @param consentStates - Optional array of consent states to filter by
     * @returns Promise that resolves when sync is complete
     */
    syncAll(consentStates?: ConsentState[]): Promise<bigint>;
    /**
     * Creates a stream for new conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new conversations
     */
    stream(callback?: StreamCallback<Group | Dm>): AsyncStream<Dm | Group>;
    /**
     * Creates a stream for new group conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new group conversations
     */
    streamGroups(callback?: StreamCallback<Group>): AsyncStream<Group>;
    /**
     * Creates a stream for new DM conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new DM conversations
     */
    streamDms(callback?: StreamCallback<Dm>): AsyncStream<Dm>;
    /**
     * Creates a stream for all new messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new messages
     */
    streamAllMessages(callback?: StreamCallback<DecodedMessage>): Promise<AsyncStream<DecodedMessage<unknown>>>;
    /**
     * Creates a stream for all new group messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new group messages
     */
    streamAllGroupMessages(callback?: StreamCallback<DecodedMessage>): Promise<AsyncStream<DecodedMessage<unknown>>>;
    /**
     * Creates a stream for all new DM messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new DM messages
     */
    streamAllDmMessages(callback?: StreamCallback<DecodedMessage>): Promise<AsyncStream<DecodedMessage<unknown>>>;
    /**
     * Retrieves HMAC keys for all conversations
     *
     * @returns The HMAC keys for all conversations
     */
    hmacKeys(): Record<string, _xmtp_node_bindings.HmacKey[]>;
}

type PreferenceUpdate = {
    type: string;
    HmacKeyUpdate?: {
        key: Uint8Array;
    };
};
/**
 * Manages user preferences and consent states
 *
 * This class is not intended to be initialized directly.
 */
declare class Preferences {
    #private;
    /**
     * Creates a new preferences instance
     *
     * @param client - The client instance managing preferences
     * @param conversations - The underlying conversations instance
     */
    constructor(client: Client$1, conversations: Conversations$1);
    /**
     * Retrieves the current inbox state
     *
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state
     */
    inboxState(refreshFromNetwork?: boolean): Promise<_xmtp_node_bindings.InboxState>;
    /**
     * Gets the latest inbox state for a specific inbox
     *
     * @param inboxId - The inbox ID to get state for
     * @returns Promise that resolves with the latest inbox state
     */
    getLatestInboxState(inboxId: string): Promise<_xmtp_node_bindings.InboxState>;
    /**
     * Retrieves inbox state for specific inbox IDs
     *
     * @param inboxIds - Array of inbox IDs to get state for
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state for the inbox IDs
     */
    inboxStateFromInboxIds(inboxIds: string[], refreshFromNetwork?: boolean): Promise<_xmtp_node_bindings.InboxState[]>;
    /**
     * Updates consent states for multiple records
     *
     * @param consentStates - Array of consent records to update
     * @returns Promise that resolves when consent states are updated
     */
    setConsentStates(consentStates: Consent[]): Promise<void>;
    /**
     * Retrieves consent state for a specific entity
     *
     * @param entityType - Type of entity to get consent for
     * @param entity - Entity identifier
     * @returns Promise that resolves with the consent state
     */
    getConsentState(entityType: ConsentEntityType, entity: string): Promise<_xmtp_node_bindings.ConsentState>;
    /**
     * Creates a stream of consent state updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for consent updates
     */
    streamConsent(callback?: StreamCallback<Consent[]>): AsyncStream<Consent[]>;
    /**
     * Creates a stream of user preference updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for preference updates
     */
    streamPreferences(callback?: StreamCallback<PreferenceUpdate>): AsyncStream<PreferenceUpdate>;
}

type SignMessage = (message: string) => Promise<Uint8Array> | Uint8Array;
type GetIdentifier = () => Promise<Identifier> | Identifier;
type GetChainId = () => bigint;
type GetBlockNumber = () => bigint;
type Signer = {
    type: "EOA";
    signMessage: SignMessage;
    getIdentifier: GetIdentifier;
} | {
    type: "SCW";
    signMessage: SignMessage;
    getIdentifier: GetIdentifier;
    getBlockNumber?: GetBlockNumber;
    getChainId: GetChainId;
};

/**
 * Client for interacting with the XMTP network
 */
declare class Client {
    #private;
    /**
     * Creates a new XMTP client instance
     *
     * This class is not intended to be initialized directly.
     * Use `Client.create` or `Client.build` instead.
     *
     * @param options - Optional configuration for the client
     */
    constructor(options?: ClientOptions);
    /**
     * Initializes the client with the provided identifier
     *
     * This is not meant to be called directly.
     * Use `Client.create` or `Client.build` instead.
     *
     * @param identifier - The identifier to initialize the client with
     */
    init(identifier: Identifier): Promise<void>;
    /**
     * Creates a new client instance with a signer
     *
     * @param signer - The signer to use for authentication
     * @param options - Optional configuration for the client
     * @returns A new client instance
     */
    static create(signer: Signer, options?: ClientOptions): Promise<Client>;
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
    static build(identifier: Identifier, options?: ClientOptions): Promise<Client>;
    /**
     * Gets the client options
     */
    get options(): ClientOptions | undefined;
    /**
     * Gets the signer associated with this client
     */
    get signer(): Signer | undefined;
    /**
     * Gets the account identifier for this client
     */
    get accountIdentifier(): Identifier | undefined;
    /**
     * Gets the inbox ID associated with this client
     */
    get inboxId(): string;
    /**
     * Gets the installation ID for this client
     */
    get installationId(): string;
    /**
     * Gets the installation ID bytes for this client
     */
    get installationIdBytes(): Uint8Array<ArrayBufferLike>;
    /**
     * Gets whether the client is registered with the XMTP network
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get isRegistered(): boolean;
    /**
     * Gets the conversations manager for this client
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get conversations(): Conversations;
    /**
     * Gets the preferences manager for this client
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    get preferences(): Preferences;
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
    unsafe_createInboxSignatureText(): Promise<string | null | undefined>;
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
    unsafe_addAccountSignatureText(newAccountIdentifier: Identifier, allowInboxReassign?: boolean): Promise<string | undefined>;
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
    unsafe_removeAccountSignatureText(identifier: Identifier): Promise<string | undefined>;
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
    unsafe_revokeAllOtherInstallationsSignatureText(): Promise<string | undefined>;
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
    unsafe_revokeInstallationsSignatureText(installationIds: Uint8Array[]): Promise<string | undefined>;
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
    unsafe_changeRecoveryIdentifierSignatureText(identifier: Identifier): Promise<string | undefined>;
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
    unsafe_addSignature(signatureType: SignatureRequestType, signatureText: string, signer: Signer): Promise<void>;
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
    unsafe_applySignatures(): Promise<void>;
    /**
     * Registers the client with the XMTP network
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {SignerUnavailableError} if no signer is available
     */
    register(): Promise<void>;
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
    unsafe_addAccount(newAccountSigner: Signer, allowInboxReassign?: boolean): Promise<void>;
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
    removeAccount(identifier: Identifier): Promise<void>;
    /**
     * Revokes all other installations of the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @throws {ClientNotInitializedError} if the client is not initialized
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    revokeAllOtherInstallations(): Promise<void>;
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
    revokeInstallations(installationIds: Uint8Array[]): Promise<void>;
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
    changeRecoveryIdentifier(identifier: Identifier): Promise<void>;
    /**
     * Checks if the client can message the specified identifiers
     *
     * @param identifiers - The identifiers to check
     * @returns Whether the client can message the identifiers
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    canMessage(identifiers: Identifier[]): Promise<Map<string, boolean>>;
    /**
     * Checks if the specified identifiers can be messaged
     *
     * @param identifiers - The identifiers to check
     * @param env - Optional XMTP environment
     * @returns Map of identifiers to whether they can be messaged
     */
    static canMessage(identifiers: Identifier[], env?: XmtpEnv): Promise<Map<string, boolean>>;
    /**
     * Gets the key package statuses for the specified installation IDs
     *
     * @param installationIds - The installation IDs to check
     * @returns The key package statuses
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    getKeyPackageStatusesForInstallationIds(installationIds: string[]): Promise<Record<string, _xmtp_node_bindings.KeyPackageStatus>>;
    /**
     * Gets the codec for a given content type
     *
     * @param contentType - The content type to get the codec for
     * @returns The codec, if found
     */
    codecFor<T = unknown>(contentType: ContentTypeId): ContentCodec<T> | undefined;
    /**
     * Encodes content for a given content type
     *
     * @param content - The content to encode
     * @param contentType - The content type to encode for
     * @returns The encoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     */
    encodeContent(content: unknown, contentType: ContentTypeId): EncodedContent<Record<string, string>>;
    /**
     * Decodes a message for a given content type
     *
     * @param message - The message to decode
     * @param contentType - The content type to decode for
     * @returns The decoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     * @throws {InvalidGroupMembershipChangeError} if the message is an invalid group membership change
     */
    decodeContent<T = unknown>(message: Message, contentType: ContentTypeId): T;
    /**
     * Finds the inbox ID for a given identifier
     *
     * @param identifier - The identifier to look up
     * @returns The inbox ID, if found
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    getInboxIdByIdentifier(identifier: Identifier): Promise<string | null>;
    /**
     * Signs a message with the installation key
     *
     * @param signatureText - The text to sign
     * @returns The signature
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    signWithInstallationKey(signatureText: string): Uint8Array<ArrayBufferLike>;
    /**
     * Verifies a signature was made with the installation key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @returns Whether the signature is valid
     * @throws {ClientNotInitializedError} if the client is not initialized
     */
    verifySignedWithInstallationKey(signatureText: string, signatureBytes: Uint8Array): boolean;
    /**
     * Verifies a signature was made with a public key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @param publicKey - The public key to verify against
     * @returns Whether the signature is valid
     */
    static verifySignedWithPublicKey(signatureText: string, signatureBytes: Uint8Array, publicKey: Uint8Array): boolean;
    /**
     * Checks if an address is authorized for an inbox
     *
     * @param inboxId - The inbox ID to check
     * @param address - The address to check
     * @param options - Optional network options
     * @returns Whether the address is authorized
     */
    static isAddressAuthorized(inboxId: string, address: string, options?: NetworkOptions): Promise<boolean>;
    /**
     * Checks if an installation is authorized for an inbox
     *
     * @param inboxId - The inbox ID to check
     * @param installation - The installation to check
     * @param options - Optional network options
     * @returns Whether the installation is authorized
     */
    static isInstallationAuthorized(inboxId: string, installation: Uint8Array, options?: NetworkOptions): Promise<boolean>;
    /**
     * Gets the version of the Node bindings
     */
    static get version(): string;
}

declare const generateInboxId: (identifier: Identifier) => string;
declare const getInboxIdForIdentifier: (identifier: Identifier, env?: XmtpEnv) => Promise<string | null>;

export { ApiUrls, Client, type ClientOptions, Conversation, Conversations, DecodedMessage, Dm, Group, HistorySyncUrls, type NetworkOptions, type OtherOptions, type PreferenceUpdate, type Signer, type StorageOptions, type StreamCallback, type XmtpEnv, generateInboxId, getInboxIdForIdentifier };
