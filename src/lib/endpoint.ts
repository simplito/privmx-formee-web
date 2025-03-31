import {
    Connection,
    CryptoApi,
    Endpoint,
    EventQueue,
    InboxApi,
    StoreApi,
    ThreadApi
} from '@simplito/privmx-webendpoint';
import { EventManager } from '@simplito/privmx-webendpoint/extra';
import {
    ConnectionEventsManager,
    InboxEventsManager
} from '@simplito/privmx-webendpoint/extra/events';

export class EndpointConnectionManager {
    private static instance: EndpointConnectionManager | null = null;
    private static cryptoApi: Promise<CryptoApi> | null = null;
    private static eventQueue: Promise<EventQueue> | null = null;
    private static isSetup = false;
    private eventManager: Promise<EventManager> | null = null;
    private threadApi: Promise<ThreadApi> | null = null;
    private storeApi: Promise<StoreApi> | null = null;
    private inboxApi: Promise<InboxApi> | null = null;
    private connectionEventManager: Promise<ConnectionEventsManager> | null = null;
    private inboxEventManager: Promise<InboxEventsManager> | null = null;

    private constructor(private connection: Connection) {}

    public static getInstance(): EndpointConnectionManager {
        if (!this.instance) {
            throw new Error('no connection established');
        }
        return this.instance;
    }

    public static removeInstance(): void {
        this.instance = null;
    }

    public getConnection(): Connection {
        if (!this.connection) {
            throw new Error('No active connection');
        }
        return this.connection;
    }

    public async getEventManager(): Promise<EventManager> {
        if (this.eventManager) {
            return this.eventManager;
        }

        this.eventManager = (async () => {
            const eventQueue = await EndpointConnectionManager.getEventQueue();
            return EventManager.startEventLoop(eventQueue);
        })();

        return await this.eventManager;
    }

    public async getConnectionEventManager(): Promise<ConnectionEventsManager> {
        if (this.connectionEventManager) {
            return this.connectionEventManager;
        }

        this.connectionEventManager = (async () => {
            const eventManager = await this.getEventManager();
            const connection = await this.getConnection();
            const connectionId = (await connection.getConnectionId()) as unknown as string;
            return eventManager.getConnectionEventManager(connectionId);
        })();

        return this.connectionEventManager;
    }

    public async getInboxEventManager(): Promise<InboxEventsManager> {
        if (this.inboxEventManager) {
            return this.inboxEventManager;
        }

        this.inboxEventManager = (async () => {
            const eventManager = await this.getEventManager();
            return eventManager.getInboxEventManager(await this.getInboxApi());
        })();

        return this.inboxEventManager;
    }

    public static async getEventQueue(): Promise<EventQueue> {
        if (this.eventQueue) {
            return this.eventQueue;
        }

        if (!this.isSetup) {
            await this.setup();
        }
        this.eventQueue = (async () => {
            return Endpoint.getEventQueue();
        })();

        return this.eventQueue;
    }

    static async connect(privateKey: string, solutionId: string, bridgeUrl: string) {
        await this.setup();
        const connection = await Endpoint.connect(privateKey, solutionId, bridgeUrl);

        if (!connection) {
            throw new Error('ERROR: Could not connect to bridge');
        }
        this.instance = new EndpointConnectionManager(connection);

        return this.instance;
    }

    public getThreadApi(): Promise<ThreadApi> {
        if (!this.threadApi) {
            this.threadApi = (() => {
                const connection = this.getConnection();
                return Endpoint.createThreadApi(connection);
            })();
        }
        return this.threadApi;
    }

    public getStoreApi(): Promise<StoreApi> {
        if (!this.storeApi) {
            this.storeApi = (async () => {
                const connection = await this.getConnection();
                return Endpoint.createStoreApi(connection);
            })();
        }
        return this.storeApi;
    }

    public getInboxApi(): Promise<InboxApi> {
        if (!this.inboxApi) {
            this.inboxApi = (async () => {
                const connection = await this.getConnection();
                const threadApi = await this.getThreadApi();
                const storeApi = await this.getStoreApi();
                return Endpoint.createInboxApi(connection, await threadApi, await storeApi);
            })();
        }
        return this.inboxApi;
    }

    public static getCryptoApi(): Promise<CryptoApi> {
        if (!this.cryptoApi) {
            this.cryptoApi = (async () => {
                await this.setup();
                return Endpoint.createCryptoApi();
            })();
        }
        return this.cryptoApi;
    }

    private static async setup(): Promise<void> {
        if (!this.isSetup) {
            await Endpoint.setup('/privmx-assets');
            this.isSetup = true;
        }
    }
}
