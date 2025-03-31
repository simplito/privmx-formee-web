export interface InboxPrivateData {
    name: string;
}

export interface InboxUsers {
    userId: string;
    publicKey: string;
    isAdmin: boolean;
}

export interface Form {
    title: string;
    inboxId: string;
    contextId: string;
    createDate: number;
    creator: string;
    users: string[];
    managers: string[];
}
