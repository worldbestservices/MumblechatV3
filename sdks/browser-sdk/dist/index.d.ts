import { ContentCodec, ContentTypeId as ContentTypeId$1, EncodedContent as EncodedContent$1 } from '@xmtp/content-type-primitives';
import * as _xmtp_wasm_bindings from '@xmtp/wasm-bindings';
import { Identifier, SignatureRequestType, ConsentState, ConsentEntityType, ConversationType, PermissionUpdateType, PermissionPolicy, MetadataField, Conversations as Conversations$1, Message, Conversation as Conversation$1, Client as Client$1, Consent, UserPreference, KeyPackageStatus, EncodedContent, MessageDisappearingSettings, HmacKey, GroupPermissionsOptions, DeliveryStatus, GroupMessageKind, ContentType, SortDirection, PermissionLevel, ContentTypeId, ListMessagesOptions, ListConversationsOptions, PermissionPolicySet, CreateGroupOptions, CreateDMOptions, Installation, InboxState, GroupMember } from '@xmtp/wasm-bindings';
export { Consent, ConsentEntityType, ConsentState, ContentType, ContentTypeId, ConversationListItem, ConversationType, CreateDMOptions, CreateGroupOptions, DeliveryStatus, EncodedContent, GroupMember, GroupMembershipState, GroupMessageKind, GroupMetadata, GroupPermissions, GroupPermissionsOptions, HmacKey, Identifier, IdentifierKind, InboxState, Installation, ListConversationsOptions, ListMessagesOptions, LogOptions, Message, MessageDisappearingSettings, MetadataField, PermissionLevel, PermissionPolicy, PermissionPolicySet, PermissionUpdateType, SignatureRequestType, SortDirection, UserPreference } from '@xmtp/wasm-bindings';

type ResolveValue<T> = {
    value: T | undefined;
    done: boolean;
};
type StreamCallback<T> = (err: Error | null, value: T | undefined) => void | Promise<void>;
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

/**
 * Pre-configured URLs for the XMTP network based on the environment
 *
 * @constant
 * @property {string} local - The local URL for the XMTP network
 * @property {string} dev - The development URL for the XMTP network
 * @property {string} production - The production URL for the XMTP network
 */
declare const ApiUrls: {
    readonly local: "http://localhost:5555";
    readonly dev: "https://dev.xmtp.network";
    readonly production: "https://production.xmtp.network";
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
type ContentOptions = {
    /**
     * Allow configuring codecs for additional content types
     */
    codecs?: ContentCodec[];
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
type OtherOptions = {
    /**
     * Enable structured JSON logging
     */
    structuredLogging?: boolean;
    /**
     * Enable performance metrics
     */
    performanceLogging?: boolean;
    /**
     * Logging level
     */
    loggingLevel?: "off" | "error" | "warn" | "info" | "debug" | "trace";
    /**
     * Disable automatic registration when creating a client
     */
    disableAutoRegister?: boolean;
};
type ClientOptions = NetworkOptions & ContentOptions & StorageOptions & OtherOptions;

type ClientEvents = 
/**
 * Stream actions
 */
{
    action: "endStream";
    id: string;
    result: undefined;
    data: {
        streamId: string;
    };
}
/**
 * Client actions
 */
 | {
    action: "init";
    id: string;
    result: {
        inboxId: string;
        installationId: string;
        installationIdBytes: Uint8Array;
    };
    data: {
        identifier: Identifier;
        options?: ClientOptions;
    };
} | {
    action: "createInboxSignatureText";
    id: string;
    result: string | undefined;
    data: undefined;
} | {
    action: "addAccountSignatureText";
    id: string;
    result: string | undefined;
    data: {
        newIdentifier: Identifier;
    };
} | {
    action: "removeAccountSignatureText";
    id: string;
    result: string | undefined;
    data: {
        identifier: Identifier;
    };
} | {
    action: "revokeAllOtherInstallationsSignatureText";
    id: string;
    result: string | undefined;
    data: undefined;
} | {
    action: "revokeInstallationsSignatureText";
    id: string;
    result: string | undefined;
    data: {
        installationIds: Uint8Array[];
    };
} | {
    action: "changeRecoveryIdentifierSignatureText";
    id: string;
    result: string | undefined;
    data: {
        identifier: Identifier;
    };
} | {
    action: "addEcdsaSignature";
    id: string;
    result: undefined;
    data: {
        type: SignatureRequestType;
        bytes: Uint8Array;
    };
} | {
    action: "addScwSignature";
    id: string;
    result: undefined;
    data: {
        type: SignatureRequestType;
        bytes: Uint8Array;
        chainId: bigint;
        blockNumber?: bigint;
    };
} | {
    action: "applySignatures";
    id: string;
    result: undefined;
    data: undefined;
} | {
    action: "registerIdentity";
    id: string;
    result: undefined;
    data: undefined;
} | {
    action: "isRegistered";
    id: string;
    result: boolean;
    data: undefined;
} | {
    action: "canMessage";
    id: string;
    result: Map<string, boolean>;
    data: {
        identifiers: Identifier[];
    };
} | {
    action: "inboxState";
    id: string;
    result: SafeInboxState;
    data: {
        refreshFromNetwork: boolean;
    };
} | {
    action: "inboxStateFromInboxIds";
    id: string;
    result: SafeInboxState[];
    data: {
        inboxIds: string[];
        refreshFromNetwork: boolean;
    };
} | {
    action: "getLatestInboxState";
    id: string;
    result: SafeInboxState;
    data: {
        inboxId: string;
    };
} | {
    action: "setConsentStates";
    id: string;
    result: undefined;
    data: {
        records: SafeConsent[];
    };
} | {
    action: "getConsentState";
    id: string;
    result: ConsentState;
    data: {
        entityType: ConsentEntityType;
        entity: string;
    };
} | {
    action: "findInboxIdByIdentifier";
    id: string;
    result: string | undefined;
    data: {
        identifier: Identifier;
    };
} | {
    action: "signWithInstallationKey";
    id: string;
    result: Uint8Array;
    data: {
        signatureText: string;
    };
} | {
    action: "verifySignedWithInstallationKey";
    id: string;
    result: boolean;
    data: {
        signatureText: string;
        signatureBytes: Uint8Array;
    };
} | {
    action: "verifySignedWithPublicKey";
    id: string;
    result: boolean;
    data: {
        signatureText: string;
        signatureBytes: Uint8Array;
        publicKey: Uint8Array;
    };
} | {
    action: "getKeyPackageStatusesForInstallationIds";
    id: string;
    result: Map<string, SafeKeyPackageStatus>;
    data: {
        installationIds: string[];
    };
}
/**
 * Conversations actions
 */
 | {
    action: "getConversationById";
    id: string;
    result: SafeConversation | undefined;
    data: {
        id: string;
    };
} | {
    action: "getMessageById";
    id: string;
    result: SafeMessage | undefined;
    data: {
        id: string;
    };
} | {
    action: "getDmByInboxId";
    id: string;
    result: SafeConversation | undefined;
    data: {
        inboxId: string;
    };
} | {
    action: "getConversations";
    id: string;
    result: SafeConversation[];
    data: {
        options?: SafeListConversationsOptions;
    };
} | {
    action: "getGroups";
    id: string;
    result: SafeConversation[];
    data: {
        options?: Omit<SafeListConversationsOptions, "conversation_type">;
    };
} | {
    action: "getDms";
    id: string;
    result: SafeConversation[];
    data: {
        options?: Omit<SafeListConversationsOptions, "conversation_type">;
    };
} | {
    action: "newGroupWithIdentifiers";
    id: string;
    result: SafeConversation;
    data: {
        identifiers: Identifier[];
        options?: SafeCreateGroupOptions;
    };
} | {
    action: "newGroupWithInboxIds";
    id: string;
    result: SafeConversation;
    data: {
        inboxIds: string[];
        options?: SafeCreateGroupOptions;
    };
} | {
    action: "newDmWithIdentifier";
    id: string;
    result: SafeConversation;
    data: {
        identifier: Identifier;
        options?: SafeCreateDmOptions;
    };
} | {
    action: "newDmWithInboxId";
    id: string;
    result: SafeConversation;
    data: {
        inboxId: string;
        options?: SafeCreateDmOptions;
    };
} | {
    action: "syncConversations";
    id: string;
    result: undefined;
    data: undefined;
} | {
    action: "syncAllConversations";
    id: string;
    result: undefined;
    data: {
        consentStates?: ConsentState[];
    };
} | {
    action: "getHmacKeys";
    id: string;
    result: SafeHmacKeys;
    data: undefined;
} | {
    action: "streamAllGroups";
    id: string;
    result: undefined;
    data: {
        streamId: string;
        conversationType?: ConversationType;
    };
} | {
    action: "streamAllMessages";
    id: string;
    result: undefined;
    data: {
        streamId: string;
        conversationType?: ConversationType;
    };
} | {
    action: "streamConsent";
    id: string;
    result: undefined;
    data: {
        streamId: string;
    };
} | {
    action: "streamPreferences";
    id: string;
    result: undefined;
    data: {
        streamId: string;
    };
}
/**
 * Group actions
 */
 | {
    action: "syncGroup";
    id: string;
    result: SafeConversation;
    data: {
        id: string;
    };
} | {
    action: "sendGroupMessage";
    id: string;
    result: string;
    data: {
        id: string;
        content: SafeEncodedContent;
    };
} | {
    action: "sendOptimisticGroupMessage";
    id: string;
    result: string;
    data: {
        id: string;
        content: SafeEncodedContent;
    };
} | {
    action: "publishGroupMessages";
    id: string;
    result: undefined;
    data: {
        id: string;
    };
} | {
    action: "getGroupMessages";
    id: string;
    result: SafeMessage[];
    data: {
        id: string;
        options?: SafeListMessagesOptions;
    };
} | {
    action: "getGroupMembers";
    id: string;
    result: SafeGroupMember[];
    data: {
        id: string;
    };
} | {
    action: "getGroupAdmins";
    id: string;
    result: string[];
    data: {
        id: string;
    };
} | {
    action: "getGroupSuperAdmins";
    id: string;
    result: string[];
    data: {
        id: string;
    };
} | {
    action: "isGroupAdmin";
    id: string;
    result: boolean;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "isGroupSuperAdmin";
    id: string;
    result: boolean;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "addGroupMembers";
    id: string;
    result: undefined;
    data: {
        id: string;
        identifiers: Identifier[];
    };
} | {
    action: "removeGroupMembers";
    id: string;
    result: undefined;
    data: {
        id: string;
        identifiers: Identifier[];
    };
} | {
    action: "addGroupMembersByInboxId";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxIds: string[];
    };
} | {
    action: "removeGroupMembersByInboxId";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxIds: string[];
    };
} | {
    action: "addGroupAdmin";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "removeGroupAdmin";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "addGroupSuperAdmin";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "removeGroupSuperAdmin";
    id: string;
    result: undefined;
    data: {
        id: string;
        inboxId: string;
    };
} | {
    action: "updateGroupName";
    id: string;
    result: undefined;
    data: {
        id: string;
        name: string;
    };
} | {
    action: "updateGroupDescription";
    id: string;
    result: undefined;
    data: {
        id: string;
        description: string;
    };
} | {
    action: "updateGroupImageUrlSquare";
    id: string;
    result: undefined;
    data: {
        id: string;
        imageUrl: string;
    };
} | {
    action: "getGroupConsentState";
    id: string;
    result: ConsentState;
    data: {
        id: string;
    };
} | {
    action: "updateGroupConsentState";
    id: string;
    result: undefined;
    data: {
        id: string;
        state: ConsentState;
    };
} | {
    action: "getDmPeerInboxId";
    id: string;
    result: string;
    data: {
        id: string;
    };
} | {
    action: "updateGroupPermissionPolicy";
    id: string;
    result: undefined;
    data: {
        id: string;
        permissionType: PermissionUpdateType;
        policy: PermissionPolicy;
        metadataField?: MetadataField;
    };
} | {
    action: "getGroupPermissions";
    id: string;
    result: SafeConversation["permissions"];
    data: {
        id: string;
    };
} | {
    action: "getGroupMessageDisappearingSettings";
    id: string;
    result: SafeMessageDisappearingSettings | undefined;
    data: {
        id: string;
    };
} | {
    action: "updateGroupMessageDisappearingSettings";
    id: string;
    result: undefined;
    data: SafeMessageDisappearingSettings & {
        id: string;
    };
} | {
    action: "removeGroupMessageDisappearingSettings";
    id: string;
    result: undefined;
    data: {
        id: string;
    };
} | {
    action: "isGroupMessageDisappearingEnabled";
    id: string;
    result: boolean;
    data: {
        id: string;
    };
} | {
    action: "streamGroupMessages";
    id: string;
    result: undefined;
    data: {
        groupId: string;
        streamId: string;
    };
} | {
    action: "getGroupPausedForVersion";
    id: string;
    result: string | undefined;
    data: {
        id: string;
    };
} | {
    action: "getGroupHmacKeys";
    id: string;
    result: SafeHmacKey[];
    data: {
        id: string;
    };
};
type ClientEventsActions = ClientEvents["action"];
type ClientEventsClientMessageData = EventsClientMessageData<ClientEvents>;
type ClientEventsWorkerMessageData = EventsWorkerMessageData<ClientEvents>;
type ClientEventsResult<A extends ClientEventsActions> = EventsResult<ClientEvents, A>;
type ClientSendMessageData<A extends ClientEventsActions> = SendMessageData<ClientEvents, A>;
type ClientEventsWorkerPostMessageData<A extends ClientEventsActions> = EventsWorkerPostMessageData<ClientEvents, A>;
type ClientEventsClientPostMessageData<A extends ClientEventsActions> = EventsClientPostMessageData<ClientEvents, A>;
type ClientEventsErrorData = EventsErrorData<ClientEvents>;

type UtilsEvents = {
    action: "init";
    id: string;
    result: undefined;
    data: {
        enableLogging: boolean;
    };
} | {
    action: "generateInboxId";
    id: string;
    result: string;
    data: {
        identifier: Identifier;
    };
} | {
    action: "getInboxIdForIdentifier";
    id: string;
    result: string | undefined;
    data: {
        identifier: Identifier;
        env?: XmtpEnv;
    };
};
type UtilsEventsActions = UtilsEvents["action"];
type UtilsEventsClientMessageData = EventsClientMessageData<UtilsEvents>;
type UtilsEventsWorkerMessageData = EventsWorkerMessageData<UtilsEvents>;
type UtilsEventsResult<A extends UtilsEventsActions> = EventsResult<UtilsEvents, A>;
type UtilsSendMessageData<A extends UtilsEventsActions> = SendMessageData<UtilsEvents, A>;
type UtilsEventsWorkerPostMessageData<A extends UtilsEventsActions> = EventsWorkerPostMessageData<UtilsEvents, A>;
type UtilsEventsClientPostMessageData<A extends UtilsEventsActions> = EventsClientPostMessageData<UtilsEvents, A>;
type UtilsEventsErrorData = EventsErrorData<UtilsEvents>;

type GenericEvent = {
    action: string;
    id: string;
    result: unknown;
    data: unknown;
};
type EventsClientMessageData<Events extends GenericEvent> = {
    [Action in Events["action"]]: Omit<Extract<Events, {
        action: Action;
    }>, "result">;
}[Events["action"]];
type EventsWorkerMessageData<Events extends GenericEvent> = {
    [Action in Events["action"]]: Omit<Extract<Events, {
        action: Action;
    }>, "data">;
}[Events["action"]];
type EventsResult<Events extends GenericEvent, Action extends Events["action"]> = Extract<Events, {
    action: Action;
}>["result"];
type SendMessageData<Events extends GenericEvent, Action extends Events["action"]> = Extract<Events, {
    action: Action;
}>["data"];
type EventsWorkerPostMessageData<Events extends GenericEvent, Action extends Events["action"]> = Omit<Extract<Events, {
    action: Action;
}>, "data">;
type EventsClientPostMessageData<Events extends GenericEvent, Action extends Events["action"]> = Omit<Extract<Events, {
    action: Action;
}>, "result">;
type EventsErrorData<Events extends GenericEvent> = {
    id: string;
    action: Events["action"];
    error: Error;
};
type GenericStreamEvent = {
    type: string;
    streamId: string;
    result: unknown;
};
type StreamEventsClientMessageData<Events extends GenericStreamEvent> = {
    [Type in Events["type"]]: Omit<Extract<Events, {
        type: Type;
    }>, "result">;
}[Events["type"]];
type StreamEventsResult<Events extends GenericStreamEvent, Type extends Events["type"]> = Extract<Events, {
    type: Type;
}>["result"];
type StreamEventsClientPostMessageData<Events extends GenericStreamEvent, Type extends Events["type"]> = Extract<Events, {
    type: Type;
}>;
type StreamEventsErrorData<Events extends GenericStreamEvent> = {
    streamId: string;
    type: Events["type"];
    error: Error;
};

declare class WorkerConversations {
    #private;
    constructor(client: WorkerClient, conversations: Conversations$1);
    sync(): Promise<void>;
    syncAll(consentStates?: ConsentState[]): Promise<number>;
    getConversationById(id: string): WorkerConversation | undefined;
    getMessageById(id: string): Message | undefined;
    getDmByInboxId(inboxId: string): WorkerConversation | undefined;
    list(options?: SafeListConversationsOptions): WorkerConversation[];
    listGroups(options?: Omit<SafeListConversationsOptions, "conversation_type">): WorkerConversation[];
    listDms(options?: Omit<SafeListConversationsOptions, "conversation_type">): WorkerConversation[];
    newGroupWithIdentifiers(identifiers: Identifier[], options?: SafeCreateGroupOptions): Promise<WorkerConversation>;
    newGroup(inboxIds: string[], options?: SafeCreateGroupOptions): Promise<WorkerConversation>;
    newDmWithIdentifier(identifier: Identifier, options?: SafeCreateDmOptions): Promise<WorkerConversation>;
    newDm(inboxId: string, options?: SafeCreateDmOptions): Promise<WorkerConversation>;
    getHmacKeys(): HmacKeys;
    stream(callback?: StreamCallback<Conversation$1>, conversationType?: ConversationType): _xmtp_wasm_bindings.StreamCloser;
    streamGroups(callback?: StreamCallback<Conversation$1>): _xmtp_wasm_bindings.StreamCloser;
    streamDms(callback?: StreamCallback<Conversation$1>): _xmtp_wasm_bindings.StreamCloser;
    streamAllMessages(callback?: StreamCallback<Message>, conversationType?: ConversationType): _xmtp_wasm_bindings.StreamCloser;
}

declare class WorkerPreferences {
    #private;
    constructor(client: Client$1, conversations: Conversations$1);
    inboxState(refreshFromNetwork: boolean): Promise<_xmtp_wasm_bindings.InboxState>;
    inboxStateFromInboxIds(inboxIds: string[], refreshFromNetwork?: boolean): Promise<_xmtp_wasm_bindings.InboxState[]>;
    getLatestInboxState(inboxId: string): Promise<_xmtp_wasm_bindings.InboxState>;
    setConsentStates(records: SafeConsent[]): Promise<void>;
    getConsentState(entityType: ConsentEntityType, entity: string): Promise<_xmtp_wasm_bindings.ConsentState>;
    streamConsent(callback?: StreamCallback<Consent[]>): _xmtp_wasm_bindings.StreamCloser;
    streamPreferences(callback?: StreamCallback<UserPreference[]>): _xmtp_wasm_bindings.StreamCloser;
}

declare class WorkerClient {
    #private;
    constructor(client: Client$1);
    static create(identifier: Identifier, options?: Omit<ClientOptions, "codecs">): Promise<WorkerClient>;
    get accountIdentifier(): Identifier;
    get inboxId(): string;
    get installationId(): string;
    get installationIdBytes(): Uint8Array<ArrayBufferLike>;
    get isRegistered(): boolean;
    get conversations(): WorkerConversations;
    get preferences(): WorkerPreferences;
    createInboxSignatureText(): string | undefined;
    addAccountSignatureText(identifier: Identifier): Promise<string | undefined>;
    removeAccountSignatureText(identifier: Identifier): Promise<string | undefined>;
    revokeAllAOtherInstallationsSignatureText(): Promise<string | undefined>;
    revokeInstallationsSignatureText(installationIds: Uint8Array[]): Promise<string | undefined>;
    changeRecoveryIdentifierSignatureText(identifier: Identifier): Promise<string | undefined>;
    addEcdsaSignature(type: SignatureRequestType, bytes: Uint8Array): Promise<void>;
    addScwSignature(type: SignatureRequestType, bytes: Uint8Array, chainId: bigint, blockNumber?: bigint): Promise<void>;
    applySignatures(): Promise<void>;
    canMessage(identifiers: Identifier[]): Promise<Map<string, boolean>>;
    registerIdentity(): Promise<void>;
    findInboxIdByIdentifier(identifier: Identifier): Promise<string | undefined>;
    signWithInstallationKey(signatureText: string): Uint8Array<ArrayBufferLike>;
    verifySignedWithInstallationKey(signatureText: string, signatureBytes: Uint8Array): boolean;
    verifySignedWithPublicKey(signatureText: string, signatureBytes: Uint8Array, publicKey: Uint8Array): boolean;
    getKeyPackageStatusesForInstallationIds(installationIds: string[]): Promise<Map<string, KeyPackageStatus>>;
}

declare class WorkerConversation {
    #private;
    constructor(client: WorkerClient, group: Conversation$1);
    get id(): string;
    get name(): string;
    updateName(name: string): Promise<void>;
    get imageUrl(): string;
    updateImageUrl(imageUrl: string): Promise<void>;
    get description(): string;
    updateDescription(description: string): Promise<void>;
    get isActive(): boolean;
    get addedByInboxId(): string;
    get createdAtNs(): bigint;
    metadata(): Promise<{
        creatorInboxId: string;
        conversationType: string;
    }>;
    members(): Promise<SafeGroupMember[]>;
    get admins(): string[];
    get superAdmins(): string[];
    get permissions(): {
        policyType: _xmtp_wasm_bindings.GroupPermissionsOptions;
        policySet: _xmtp_wasm_bindings.PermissionPolicySet;
    };
    updatePermission(permissionType: PermissionUpdateType, policy: PermissionPolicy, metadataField?: MetadataField): Promise<void>;
    isAdmin(inboxId: string): boolean;
    isSuperAdmin(inboxId: string): boolean;
    sync(): Promise<void>;
    addMembersByIdentifiers(identifiers: Identifier[]): Promise<void>;
    addMembers(inboxIds: string[]): Promise<void>;
    removeMembersByIdentifiers(identifiers: Identifier[]): Promise<void>;
    removeMembers(inboxIds: string[]): Promise<void>;
    addAdmin(inboxId: string): Promise<void>;
    removeAdmin(inboxId: string): Promise<void>;
    addSuperAdmin(inboxId: string): Promise<void>;
    removeSuperAdmin(inboxId: string): Promise<void>;
    publishMessages(): Promise<void>;
    sendOptimistic(encodedContent: EncodedContent): string;
    send(encodedContent: EncodedContent): Promise<string>;
    messages(options?: SafeListMessagesOptions): Promise<Message[]>;
    get consentState(): ConsentState;
    updateConsentState(state: ConsentState): void;
    dmPeerInboxId(): string;
    messageDisappearingSettings(): MessageDisappearingSettings | undefined;
    updateMessageDisappearingSettings(fromNs: bigint, inNs: bigint): Promise<void>;
    removeMessageDisappearingSettings(): Promise<void>;
    isMessageDisappearingEnabled(): boolean;
    stream(callback?: StreamCallback<Message>): _xmtp_wasm_bindings.StreamCloser;
    pausedForVersion(): string | undefined;
    getHmacKeys(): HmacKey[];
}

declare const toContentTypeId: (contentTypeId: ContentTypeId) => ContentTypeId$1;
declare const fromContentTypeId: (contentTypeId: ContentTypeId$1) => ContentTypeId;
type SafeContentTypeId = {
    authorityId: string;
    typeId: string;
    versionMajor: number;
    versionMinor: number;
};
declare const toSafeContentTypeId: (contentTypeId: ContentTypeId$1) => SafeContentTypeId;
declare const fromSafeContentTypeId: (contentTypeId: SafeContentTypeId) => ContentTypeId$1;
declare const toEncodedContent: (content: EncodedContent) => EncodedContent$1;
declare const fromEncodedContent: (content: EncodedContent$1) => EncodedContent;
type SafeEncodedContent = {
    type: SafeContentTypeId;
    parameters: Record<string, string>;
    fallback?: string;
    compression?: number;
    content: Uint8Array;
};
declare const toSafeEncodedContent: (content: EncodedContent$1) => SafeEncodedContent;
declare const fromSafeEncodedContent: (content: SafeEncodedContent) => EncodedContent$1;
type SafeMessage = {
    content: SafeEncodedContent;
    convoId: string;
    deliveryStatus: DeliveryStatus;
    id: string;
    kind: GroupMessageKind;
    senderInboxId: string;
    sentAtNs: bigint;
};
declare const toSafeMessage: (message: Message) => SafeMessage;
type SafeListMessagesOptions = {
    contentTypes?: ContentType[];
    deliveryStatus?: DeliveryStatus;
    direction?: SortDirection;
    limit?: bigint;
    sentAfterNs?: bigint;
    sentBeforeNs?: bigint;
};
declare const toSafeListMessagesOptions: (options: ListMessagesOptions) => SafeListMessagesOptions;
declare const fromSafeListMessagesOptions: (options: SafeListMessagesOptions) => ListMessagesOptions;
type SafeListConversationsOptions = {
    consentStates?: ConsentState[];
    createdAfterNs?: bigint;
    createdBeforeNs?: bigint;
    includeDuplicateDms?: boolean;
    limit?: bigint;
};
declare const toSafeListConversationsOptions: (options: ListConversationsOptions) => SafeListConversationsOptions;
declare const fromSafeListConversationsOptions: (options: SafeListConversationsOptions) => ListConversationsOptions;
type SafePermissionPolicySet = {
    addAdminPolicy: PermissionPolicy;
    addMemberPolicy: PermissionPolicy;
    removeAdminPolicy: PermissionPolicy;
    removeMemberPolicy: PermissionPolicy;
    updateGroupDescriptionPolicy: PermissionPolicy;
    updateGroupImageUrlSquarePolicy: PermissionPolicy;
    updateGroupNamePolicy: PermissionPolicy;
    updateMessageDisappearingPolicy: PermissionPolicy;
};
declare const toSafePermissionPolicySet: (policySet: PermissionPolicySet) => SafePermissionPolicySet;
declare const fromSafePermissionPolicySet: (policySet: SafePermissionPolicySet) => PermissionPolicySet;
type SafeCreateGroupOptions = {
    customPermissionPolicySet?: SafePermissionPolicySet;
    description?: string;
    imageUrlSquare?: string;
    messageDisappearingSettings?: SafeMessageDisappearingSettings;
    name?: string;
    permissions?: GroupPermissionsOptions;
};
declare const toSafeCreateGroupOptions: (options: CreateGroupOptions) => SafeCreateGroupOptions;
declare const fromSafeCreateGroupOptions: (options: SafeCreateGroupOptions) => CreateGroupOptions;
type SafeCreateDmOptions = {
    messageDisappearingSettings?: SafeMessageDisappearingSettings;
};
declare const toSafeCreateDmOptions: (options: CreateDMOptions) => SafeCreateDmOptions;
declare const fromSafeCreateDmOptions: (options: SafeCreateDmOptions) => CreateDMOptions;
type SafeConversation = {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    permissions: {
        policyType: GroupPermissionsOptions;
        policySet: {
            addAdminPolicy: PermissionPolicy;
            addMemberPolicy: PermissionPolicy;
            removeAdminPolicy: PermissionPolicy;
            removeMemberPolicy: PermissionPolicy;
            updateGroupDescriptionPolicy: PermissionPolicy;
            updateGroupImageUrlSquarePolicy: PermissionPolicy;
            updateGroupNamePolicy: PermissionPolicy;
            updateMessageDisappearingPolicy: PermissionPolicy;
        };
    };
    isActive: boolean;
    addedByInboxId: string;
    metadata: {
        creatorInboxId: string;
        conversationType: string;
    };
    admins: string[];
    superAdmins: string[];
    createdAtNs: bigint;
};
declare const toSafeConversation: (conversation: WorkerConversation) => Promise<SafeConversation>;
type SafeInstallation = {
    bytes: Uint8Array;
    clientTimestampNs?: bigint;
    id: string;
};
declare const toSafeInstallation: (installation: Installation) => SafeInstallation;
type SafeInboxState = {
    accountIdentifiers: Identifier[];
    inboxId: string;
    installations: SafeInstallation[];
    recoveryIdentifier: Identifier;
};
declare const toSafeInboxState: (inboxState: InboxState) => SafeInboxState;
type SafeConsent = {
    entity: string;
    entityType: ConsentEntityType;
    state: ConsentState;
};
declare const toSafeConsent: (consent: Consent) => SafeConsent;
declare const fromSafeConsent: (consent: SafeConsent) => Consent;
type SafeGroupMember = {
    accountIdentifiers: Identifier[];
    consentState: ConsentState;
    inboxId: string;
    installationIds: string[];
    permissionLevel: PermissionLevel;
};
declare const toSafeGroupMember: (member: GroupMember) => SafeGroupMember;
declare const fromSafeGroupMember: (member: SafeGroupMember) => GroupMember;
type SafeHmacKey = {
    key: Uint8Array;
    epoch: bigint;
};
declare const toSafeHmacKey: (hmacKey: HmacKey) => SafeHmacKey;
type HmacKeys = Map<string, HmacKey[]>;
type SafeHmacKeys = Record<string, SafeHmacKey[]>;
type SafeMessageDisappearingSettings = {
    fromNs: bigint;
    inNs: bigint;
};
declare const toSafeMessageDisappearingSettings: (settings: MessageDisappearingSettings) => SafeMessageDisappearingSettings;
declare const fromSafeMessageDisappearingSettings: (settings: SafeMessageDisappearingSettings) => MessageDisappearingSettings;
type SafeKeyPackageStatus = {
    lifetime?: {
        notBefore: bigint;
        notAfter: bigint;
    };
    validationError?: string;
};
declare const toSafeKeyPackageStatus: (status: KeyPackageStatus) => SafeKeyPackageStatus;

type ClientStreamEvents = {
    type: "message";
    streamId: string;
    result: SafeMessage | undefined;
} | {
    type: "group";
    streamId: string;
    result: SafeConversation | undefined;
} | {
    type: "consent";
    streamId: string;
    result: SafeConsent[] | undefined;
} | {
    type: "preferences";
    streamId: string;
    result: UserPreference[] | undefined;
};

declare class ClientWorkerClass {
    #private;
    constructor(worker: Worker, enableLogging: boolean);
    sendMessage<A extends ClientEventsActions>(action: A, data: ClientSendMessageData<A>): Promise<ClientEventsResult<A>>;
    handleMessage: (event: MessageEvent<ClientEventsWorkerMessageData | ClientEventsErrorData>) => void;
    handleStreamMessage: <T extends ClientStreamEvents["result"]>(streamId: string, callback: (error: Error | null, value: T | null) => void) => () => void;
    close(): void;
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
 * @property {Map<string, string>} parameters - Additional parameters associated with the message
 * @property {SafeMessage["content"]} encodedContent - Raw encoded content of the message
 * @property {string} senderInboxId - Identifier for the sender's inbox
 * @property {bigint} sentAtNs - Timestamp when the message was sent (in nanoseconds)
 */
declare class DecodedMessage<T = unknown> {
    #private;
    content: T | undefined;
    contentType: ContentTypeId$1;
    conversationId: string;
    deliveryStatus: MessageDeliveryStatus;
    fallback?: string;
    compression?: number;
    id: string;
    kind: MessageKind;
    parameters: Map<string, string>;
    encodedContent: SafeMessage["content"];
    senderInboxId: string;
    sentAtNs: bigint;
    constructor(client: Client, message: SafeMessage);
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
     * @param id - The unique identifier for this conversation
     * @param data - Optional conversation data to initialize with
     */
    constructor(client: Client, id: string, data?: SafeConversation);
    get id(): string;
    get isActive(): boolean | undefined;
    get addedByInboxId(): string | undefined;
    get createdAtNs(): bigint | undefined;
    get createdAt(): Date | undefined;
    get metadata(): {
        creatorInboxId: string;
        conversationType: string;
    } | undefined;
    /**
     * Gets the conversation members
     *
     * @returns Promise that resolves with the conversation members
     */
    members(): Promise<SafeGroupMember[]>;
    /**
     * Synchronizes conversation data from the network
     *
     * @returns Promise that resolves with the updated conversation data
     */
    sync(): Promise<SafeConversation>;
    /**
     * Publishes pending messages that were sent optimistically
     *
     * @returns Promise that resolves when publishing is complete
     */
    publishMessages(): Promise<undefined>;
    /**
     * Prepares a message to be published
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    sendOptimistic(content: unknown, contentType?: ContentTypeId$1): Promise<string>;
    /**
     * Publishes a new message
     *
     * @param content - The content to send
     * @param contentType - Optional content type of the message content
     * @returns Promise that resolves with the message ID after it has been sent
     * @throws {MissingContentTypeError} if content type is required but not provided
     */
    send(content: unknown, contentType?: ContentTypeId$1): Promise<string>;
    /**
     * Lists messages in this conversation
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of decoded messages
     */
    messages(options?: SafeListMessagesOptions): Promise<DecodedMessage<unknown>[]>;
    /**
     * Gets the consent state for this conversation
     *
     * @returns Promise that resolves with the current consent state
     */
    consentState(): Promise<ConsentState>;
    /**
     * Updates the consent state for this conversation
     *
     * @param state - The new consent state to set
     * @returns Promise that resolves when the update is complete
     */
    updateConsentState(state: ConsentState): Promise<undefined>;
    /**
     * Gets the message disappearing settings for this conversation
     *
     * @returns Promise that resolves with the current message disappearing settings
     */
    messageDisappearingSettings(): Promise<SafeMessageDisappearingSettings | undefined>;
    /**
     * Updates message disappearing settings for this conversation
     *
     * @param fromNs - The timestamp from which messages should start disappearing
     * @param inNs - The duration after which messages should disappear
     * @returns Promise that resolves when the update is complete
     */
    updateMessageDisappearingSettings(fromNs: bigint, inNs: bigint): Promise<undefined>;
    /**
     * Removes message disappearing settings from this conversation
     *
     * @returns Promise that resolves when the settings are removed
     */
    removeMessageDisappearingSettings(): Promise<undefined>;
    /**
     * Checks if message disappearing is enabled for this conversation
     *
     * @returns Promise that resolves with whether message disappearing is enabled
     */
    isMessageDisappearingEnabled(): Promise<boolean>;
    /**
     * Creates a stream for new messages in this conversation
     *
     * @param callback - Optional callback function for handling new stream values
     * @returns Stream instance for new messages
     */
    stream(callback?: StreamCallback<DecodedMessage>): Promise<AsyncStream<DecodedMessage<unknown>>>;
    pausedForVersion(): Promise<string | undefined>;
    /**
     * Retrieves HMAC keys for this conversation
     *
     * @returns Promise that resolves with the HMAC keys
     */
    getHmacKeys(): Promise<SafeHmacKey[]>;
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
     * @param id - Identifier for the direct message conversation
     * @param data - Optional conversation data to initialize with
     */
    constructor(client: Client, id: string, data?: SafeConversation);
    /**
     * Retrieves the inbox ID of the other participant in the DM
     *
     * @returns Promise that resolves with the peer's inbox ID
     */
    peerInboxId(): Promise<string>;
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
     * @param id - Identifier for the group conversation
     * @param data - Optional conversation data to initialize with
     */
    constructor(client: Client, id: string, data?: SafeConversation);
    /**
     * Synchronizes the group's data with the network
     *
     * @returns Updated group data
     */
    sync(): Promise<SafeConversation>;
    /**
     * The name of the group
     */
    get name(): string | undefined;
    /**
     * Updates the group's name
     *
     * @param name The new name for the group
     */
    updateName(name: string): Promise<void>;
    /**
     * The image URL of the group
     */
    get imageUrl(): string | undefined;
    /**
     * Updates the group's image URL
     *
     * @param imageUrl The new image URL for the group
     */
    updateImageUrl(imageUrl: string): Promise<void>;
    /**
     * The description of the group
     */
    get description(): string | undefined;
    /**
     * Updates the group's description
     *
     * @param description The new description for the group
     */
    updateDescription(description: string): Promise<void>;
    /**
     * The list of admins of the group by inbox ID
     */
    get admins(): string[];
    /**
     * The list of super admins of the group by inbox ID
     */
    get superAdmins(): string[];
    /**
     * Fetches and updates the list of group admins from the server
     *
     * @returns Array of admin inbox IDs
     */
    listAdmins(): Promise<string[]>;
    /**
     * Fetches and updates the list of group super admins from the server
     *
     * @returns Array of super admin inbox IDs
     */
    listSuperAdmins(): Promise<string[]>;
    /**
     * Retrieves the group's permissions
     *
     * @returns The group's permissions
     */
    permissions(): Promise<{
        policyType: _xmtp_wasm_bindings.GroupPermissionsOptions;
        policySet: {
            addAdminPolicy: PermissionPolicy;
            addMemberPolicy: PermissionPolicy;
            removeAdminPolicy: PermissionPolicy;
            removeMemberPolicy: PermissionPolicy;
            updateGroupDescriptionPolicy: PermissionPolicy;
            updateGroupImageUrlSquarePolicy: PermissionPolicy;
            updateGroupNamePolicy: PermissionPolicy;
            updateMessageDisappearingPolicy: PermissionPolicy;
        };
    }>;
    /**
     * Updates a specific permission policy for the group
     *
     * @param permissionType The type of permission to update
     * @param policy The new permission policy
     * @param metadataField Optional metadata field for the permission
     */
    updatePermission(permissionType: PermissionUpdateType, policy: PermissionPolicy, metadataField?: MetadataField): Promise<undefined>;
    /**
     * Checks if an inbox is an admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is an admin
     */
    isAdmin(inboxId: string): Promise<boolean>;
    /**
     * Checks if an inbox is a super admin of the group
     *
     * @param inboxId The inbox ID to check
     * @returns Boolean indicating if the inbox is a super admin
     */
    isSuperAdmin(inboxId: string): Promise<boolean>;
    /**
     * Adds members to the group using identifiers
     *
     * @param identifiers Array of member identifiers to add
     */
    addMembersByIdentifiers(identifiers: Identifier[]): Promise<undefined>;
    /**
     * Adds members to the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to add
     */
    addMembers(inboxIds: string[]): Promise<undefined>;
    /**
     * Removes members from the group using identifiers
     *
     * @param identifiers Array of member identifiers to remove
     */
    removeMembersByIdentifiers(identifiers: Identifier[]): Promise<undefined>;
    /**
     * Removes members from the group using inbox IDs
     *
     * @param inboxIds Array of inbox IDs to remove
     */
    removeMembers(inboxIds: string[]): Promise<undefined>;
    /**
     * Promotes a group member to admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    addAdmin(inboxId: string): Promise<undefined>;
    /**
     * Removes admin status from a group member
     *
     * @param inboxId The inbox ID of the admin to demote
     */
    removeAdmin(inboxId: string): Promise<undefined>;
    /**
     * Promotes a group member to super admin status
     *
     * @param inboxId The inbox ID of the member to promote
     */
    addSuperAdmin(inboxId: string): Promise<undefined>;
    /**
     * Removes super admin status from a group member
     *
     * @param inboxId The inbox ID of the super admin to demote
     */
    removeSuperAdmin(inboxId: string): Promise<undefined>;
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
     */
    constructor(client: Client);
    /**
     * Synchronizes conversations for the current client from the network
     *
     * @returns Promise that resolves when sync is complete
     */
    sync(): Promise<undefined>;
    /**
     * Synchronizes all conversations and messages from the network with optional
     * consent state filtering, then uploads conversation and message history to
     * the history sync server
     *
     * @param consentStates - Optional array of consent states to filter by
     * @returns Promise that resolves when sync is complete
     */
    syncAll(consentStates?: ConsentState[]): Promise<undefined>;
    /**
     * Retrieves a conversation by its ID
     *
     * @param id - The conversation ID to look up
     * @returns Promise that resolves with the conversation, if found
     */
    getConversationById(id: string): Promise<Dm | Group | undefined>;
    /**
     * Retrieves a message by its ID
     *
     * @param id - The message ID to look up
     * @returns Promise that resolves with the decoded message, if found
     */
    getMessageById<T = unknown>(id: string): Promise<DecodedMessage<T> | undefined>;
    /**
     * Retrieves a DM by inbox ID
     *
     * @param inboxId - The inbox ID to look up
     * @returns Promise that resolves with the DM, if found
     */
    getDmByInboxId(inboxId: string): Promise<Dm | undefined>;
    /**
     * Lists all conversations with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of conversations
     */
    list(options?: SafeListConversationsOptions): Promise<(Dm | Group)[]>;
    /**
     * Lists all group conversations with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of groups
     */
    listGroups(options?: Omit<SafeListConversationsOptions, "conversation_type">): Promise<Group[]>;
    /**
     * Lists all DM conversations with optional filtering
     *
     * @param options - Optional filtering and pagination options
     * @returns Promise that resolves with an array of DMs
     */
    listDms(options?: Omit<SafeListConversationsOptions, "conversation_type">): Promise<Dm[]>;
    /**
     * Creates a new group conversation with the specified identifiers
     *
     * @param identifiers - Array of identifiers for group members
     * @param options - Optional group creation options
     * @returns Promise that resolves with the new group
     */
    newGroupWithIdentifiers(identifiers: Identifier[], options?: SafeCreateGroupOptions): Promise<Group>;
    /**
     * Creates a new group conversation with the specified inbox IDs
     *
     * @param inboxIds - Array of inbox IDs for group members
     * @param options - Optional group creation options
     * @returns Promise that resolves with the new group
     */
    newGroup(inboxIds: string[], options?: SafeCreateGroupOptions): Promise<Group>;
    /**
     * Creates a new DM conversation with the specified identifier
     *
     * @param identifier - Identifier for the DM recipient
     * @param options - Optional DM creation options
     * @returns Promise that resolves with the new DM
     */
    newDmWithIdentifier(identifier: Identifier, options?: SafeCreateDmOptions): Promise<Dm>;
    /**
     * Creates a new DM conversation with the specified inbox ID
     *
     * @param inboxId - Inbox ID for the DM recipient
     * @param options - Optional DM creation options
     * @returns Promise that resolves with the new DM
     */
    newDm(inboxId: string, options?: SafeCreateDmOptions): Promise<Dm>;
    /**
     * Retrieves HMAC keys for all conversations
     *
     * @returns Promise that resolves with the HMAC keys for all conversations
     */
    getHmacKeys(): Promise<SafeHmacKeys>;
    /**
     * Creates a stream for new conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @param conversationType - Optional type to filter conversations
     * @returns Stream instance for new conversations
     */
    stream<T extends Group | Dm = Group | Dm>(callback?: StreamCallback<T>, conversationType?: ConversationType): Promise<AsyncStream<T>>;
    /**
     * Creates a stream for new group conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new group conversations
     */
    streamGroups(callback?: StreamCallback<Group>): Promise<AsyncStream<Group>>;
    /**
     * Creates a stream for new DM conversations
     *
     * @param callback - Optional callback function for handling new stream value
     * @returns Stream instance for new DM conversations
     */
    streamDms(callback?: StreamCallback<Dm>): Promise<AsyncStream<Dm>>;
    /**
     * Creates a stream for all new messages
     *
     * @param callback - Optional callback function for handling new stream value
     * @param conversationType - Optional conversation type to filter messages
     * @returns Stream instance for new messages
     */
    streamAllMessages(callback?: StreamCallback<DecodedMessage>, conversationType?: ConversationType): Promise<AsyncStream<DecodedMessage<unknown>>>;
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
}

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
     */
    constructor(client: Client);
    /**
     * Retrieves the current inbox state
     *
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state
     */
    inboxState(refreshFromNetwork?: boolean): Promise<SafeInboxState>;
    /**
     * Retrieves inbox state for specific inbox IDs
     *
     * @param inboxIds - Array of inbox IDs to get state for
     * @param refreshFromNetwork - Optional flag to force refresh from network
     * @returns Promise that resolves with the inbox state for the inbox IDs
     */
    inboxStateFromInboxIds(inboxIds: string[], refreshFromNetwork?: boolean): Promise<SafeInboxState[]>;
    /**
     * Gets the latest inbox state for a specific inbox
     *
     * @param inboxId - The inbox ID to get state for
     * @returns Promise that resolves with the latest inbox state
     */
    getLatestInboxState(inboxId: string): Promise<SafeInboxState>;
    /**
     * Updates consent states for multiple records
     *
     * @param records - Array of consent records to update
     * @returns Promise that resolves when consent states are updated
     */
    setConsentStates(records: SafeConsent[]): Promise<undefined>;
    /**
     * Retrieves consent state for a specific entity
     *
     * @param entityType - Type of entity to get consent for
     * @param entity - Entity identifier
     * @returns Promise that resolves with the consent state
     */
    getConsentState(entityType: ConsentEntityType, entity: string): Promise<_xmtp_wasm_bindings.ConsentState>;
    /**
     * Creates a stream of consent state updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for consent updates
     */
    streamConsent(callback?: StreamCallback<SafeConsent[]>): Promise<AsyncStream<SafeConsent[]>>;
    /**
     * Creates a stream of user preference updates
     *
     * @param callback - Optional callback function for handling stream updates
     * @returns Stream instance for preference updates
     */
    streamPreferences(callback?: StreamCallback<UserPreference[]>): Promise<AsyncStream<UserPreference[]>>;
}

type SignMessage = (message: string) => Promise<Uint8Array> | Uint8Array;
type GetIdentifier = () => Promise<Identifier> | Identifier;
type GetChainId = () => bigint;
type GetBlockNumber = () => bigint;
type Signer = {
    type: "EOA";
    getIdentifier: GetIdentifier;
    signMessage: SignMessage;
} | {
    type: "SCW";
    getIdentifier: GetIdentifier;
    signMessage: SignMessage;
    getBlockNumber?: GetBlockNumber;
    getChainId: GetChainId;
};

/**
 * Client for interacting with the XMTP network
 */
declare class Client extends ClientWorkerClass {
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
     * Gets whether the client has been initialized
     */
    get isReady(): boolean;
    /**
     * Gets the inbox ID associated with this client
     */
    get inboxId(): string | undefined;
    /**
     * Gets the account identifier for this client
     */
    get accountIdentifier(): Identifier | undefined;
    /**
     * Gets the installation ID for this client
     */
    get installationId(): string | undefined;
    /**
     * Gets the installation ID bytes for this client
     */
    get installationIdBytes(): Uint8Array<ArrayBufferLike> | undefined;
    /**
     * Gets the conversations manager for this client
     */
    get conversations(): Conversations;
    /**
     * Gets the preferences manager for this client
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
     */
    unsafe_createInboxSignatureText(): Promise<string | undefined>;
    /**
     * Creates signature text for adding a new account to the client's inbox
     *
     * WARNING: This function should be used with caution. It is only provided
     * for use in special cases where the provided workflows do not meet the
     * requirements of an application.
     *
     * It is highly recommended to use the `unsafe_addAccount` method instead.
     *
     * @param newIdentifier - The identifier of the new account
     * @param allowInboxReassign - Whether to allow inbox reassignment
     * @returns The signature text
     */
    unsafe_addAccountSignatureText(newIdentifier: Identifier, allowInboxReassign?: boolean): Promise<string | undefined>;
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
     * @warning This is an unsafe operation and should be used with caution
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
     */
    unsafe_applySignatures(): Promise<undefined>;
    /**
     * Registers the client with the XMTP network
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @throws {SignerUnavailableError} if no signer is available
     */
    register(): Promise<undefined>;
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
     * @param accountIdentifier - The identifier of the account to remove
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    removeAccount(accountIdentifier: Identifier): Promise<void>;
    /**
     * Revokes all other installations of the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
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
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    revokeInstallations(installationIds: Uint8Array[]): Promise<void>;
    /**
     * Changes the recovery identifier for the client's inbox
     *
     * Requires a signer, use `Client.create` to create a client with a signer.
     *
     * @param identifier - The new recovery identifier
     * @throws {GenerateSignatureError} if the signature cannot be generated
     * @throws {SignerUnavailableError} if no signer is available
     */
    changeRecoveryIdentifier(identifier: Identifier): Promise<void>;
    /**
     * Checks if the client is registered with the XMTP network
     *
     * @returns Whether the client is registered
     */
    isRegistered(): Promise<boolean>;
    /**
     * Checks if the client can message the specified identifiers
     *
     * @param identifiers - The identifiers to check
     * @returns Whether the client can message the identifiers
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
     * Finds the inbox ID for a given identifier
     *
     * @param identifier - The identifier to look up
     * @returns The inbox ID, if found
     */
    findInboxIdByIdentifier(identifier: Identifier): Promise<string | undefined>;
    /**
     * Gets the codec for a given content type
     *
     * @param contentType - The content type to get the codec for
     * @returns The codec, if found
     */
    codecFor<T = unknown>(contentType: ContentTypeId$1): ContentCodec<T> | undefined;
    /**
     * Encodes content for a given content type
     *
     * @param content - The content to encode
     * @param contentType - The content type to encode for
     * @returns The encoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     */
    encodeContent(content: unknown, contentType: ContentTypeId$1): SafeEncodedContent;
    /**
     * Decodes a message for a given content type
     *
     * @param message - The message to decode
     * @param contentType - The content type to decode for
     * @returns The decoded content
     * @throws {CodecNotFoundError} if no codec is found for the content type
     * @throws {InvalidGroupMembershipChangeError} if the message is an invalid group membership change
     */
    decodeContent<T = unknown>(message: SafeMessage, contentType: ContentTypeId$1): T;
    /**
     * Signs a message with the installation key
     *
     * @param signatureText - The text to sign
     * @returns The signature
     */
    signWithInstallationKey(signatureText: string): Promise<Uint8Array<ArrayBufferLike>>;
    /**
     * Verifies a signature was made with the installation key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @returns Whether the signature is valid
     */
    verifySignedWithInstallationKey(signatureText: string, signatureBytes: Uint8Array): Promise<boolean>;
    /**
     * Verifies a signature was made with a public key
     *
     * @param signatureText - The text that was signed
     * @param signatureBytes - The signature bytes to verify
     * @param publicKey - The public key to verify against
     * @returns Whether the signature is valid
     */
    verifySignedWithPublicKey(signatureText: string, signatureBytes: Uint8Array, publicKey: Uint8Array): Promise<boolean>;
    /**
     * Gets the key package statuses for the specified installation IDs
     *
     * @param installationIds - The installation IDs to check
     * @returns The key package statuses
     */
    getKeyPackageStatusesForInstallationIds(installationIds: string[]): Promise<Map<string, SafeKeyPackageStatus>>;
}

declare class UtilsWorkerClass {
    #private;
    constructor(worker: Worker, enableLogging: boolean);
    init(enableLogging: boolean): Promise<undefined>;
    sendMessage<A extends UtilsEventsActions>(action: A, data: UtilsSendMessageData<A>): Promise<UtilsEventsResult<A>>;
    handleMessage: (event: MessageEvent<UtilsEventsWorkerMessageData | UtilsEventsErrorData>) => void;
    close(): void;
}

/**
 * Utility class that provides helper functions for XMTP inbox IDs
 */
declare class Utils extends UtilsWorkerClass {
    /**
     * Creates a new Utils instance
     *
     * @param enableLogging - Optional flag to enable logging
     */
    constructor(enableLogging?: boolean);
    /**
     * Generates an inbox ID for a given identifier
     *
     * @param identifier - The identifier to generate an inbox ID for
     * @returns Promise that resolves with the generated inbox ID
     */
    generateInboxId(identifier: Identifier): Promise<string>;
    /**
     * Gets the inbox ID for a specific identifier and optional environment
     *
     * @param identifier - The identifier to get the inbox ID for
     * @param env - Optional XMTP environment configuration (default: "dev")
     * @returns Promise that resolves with the inbox ID for the identifier
     */
    getInboxIdForIdentifier(identifier: Identifier, env?: XmtpEnv): Promise<string | undefined>;
}

export { ApiUrls, Client, type ClientEvents, type ClientEventsActions, type ClientEventsClientMessageData, type ClientEventsClientPostMessageData, type ClientEventsErrorData, type ClientEventsResult, type ClientEventsWorkerMessageData, type ClientEventsWorkerPostMessageData, type ClientOptions, type ClientSendMessageData, type ContentOptions, Conversation, Conversations, DecodedMessage, Dm, type EventsClientMessageData, type EventsClientPostMessageData, type EventsErrorData, type EventsResult, type EventsWorkerMessageData, type EventsWorkerPostMessageData, type GenericEvent, type GenericStreamEvent, Group, HistorySyncUrls, type HmacKeys, type MessageDeliveryStatus, type MessageKind, type NetworkOptions, type OtherOptions, type SafeConsent, type SafeContentTypeId, type SafeConversation, type SafeCreateDmOptions, type SafeCreateGroupOptions, type SafeEncodedContent, type SafeGroupMember, type SafeHmacKey, type SafeHmacKeys, type SafeInboxState, type SafeInstallation, type SafeKeyPackageStatus, type SafeListConversationsOptions, type SafeListMessagesOptions, type SafeMessage, type SafeMessageDisappearingSettings, type SafePermissionPolicySet, type SendMessageData, type Signer, type StorageOptions, type StreamEventsClientMessageData, type StreamEventsClientPostMessageData, type StreamEventsErrorData, type StreamEventsResult, Utils, type UtilsEvents, type UtilsEventsActions, type UtilsEventsClientMessageData, type UtilsEventsClientPostMessageData, type UtilsEventsErrorData, type UtilsEventsResult, type UtilsEventsWorkerMessageData, type UtilsEventsWorkerPostMessageData, type UtilsSendMessageData, type XmtpEnv, fromContentTypeId, fromEncodedContent, fromSafeConsent, fromSafeContentTypeId, fromSafeCreateDmOptions, fromSafeCreateGroupOptions, fromSafeEncodedContent, fromSafeGroupMember, fromSafeListConversationsOptions, fromSafeListMessagesOptions, fromSafeMessageDisappearingSettings, fromSafePermissionPolicySet, toContentTypeId, toEncodedContent, toSafeConsent, toSafeContentTypeId, toSafeConversation, toSafeCreateDmOptions, toSafeCreateGroupOptions, toSafeEncodedContent, toSafeGroupMember, toSafeHmacKey, toSafeInboxState, toSafeInstallation, toSafeKeyPackageStatus, toSafeListConversationsOptions, toSafeListMessagesOptions, toSafeMessage, toSafeMessageDisappearingSettings, toSafePermissionPolicySet };
