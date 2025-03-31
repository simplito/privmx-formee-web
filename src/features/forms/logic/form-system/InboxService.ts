import { Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { Form, InboxUsers } from './types';
import { EndpointConnectionManager } from '@/lib/endpoint';
import { InboxApi } from '@simplito/privmx-webendpoint';
import { UserWithPubKey } from '@simplito/privmx-webendpoint/Types';
import { Utils } from '@simplito/privmx-webendpoint/extra';

export class InboxService implements Service {
    getName = () => 'InboxService';
    private _ctx: AppContext;
    private _bus: AppEventBus;
    private inboxApi: InboxApi;

    bind(ctx: AppContext, bus: AppEventBus) {
        this._ctx = ctx;
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', () => {
            this.setupEvents();
        });
        this._bus.registerSubscriber(subscriber);
        return this;
    }

    async setupEvents() {
        this.inboxApi = await EndpointConnectionManager.getInstance().getInboxApi();
    }

    contextId() {
        return this._ctx.user.contextId;
    }

    async createInbox({ users, title }: { title: string; users: InboxUsers[] }) {
        const allUsers: UserWithPubKey[] = users.map((user) => {
            return {
                userId: user.userId,
                pubKey: user.publicKey
            };
        });

        const managers: UserWithPubKey[] = users
            .filter((user) => user.isAdmin)
            .map((user) => {
                return {
                    userId: user.userId,
                    pubKey: user.publicKey
                };
            });
        const inboxMeta = {
            customData: '',
            name: title
        };

        const inboxId = await this.inboxApi.createInbox(
            this.contextId(),
            allUsers,
            managers,
            Utils.serializeObject(inboxMeta),
            Utils.serializeObject({})
        );

        return {
            title,
            inboxId,
            contextId: this.contextId(),
            users: allUsers.map((usr) => usr.userId),
            managers: managers.map((usr) => usr.userId),
            createDate: Date.now(),
            creator: this._ctx.user.username
        } satisfies Form;
    }

    async deleteInbox(inboxId: string) {
        await this.inboxApi.deleteInbox(inboxId);
    }
}
