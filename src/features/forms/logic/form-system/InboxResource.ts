import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { Form, InboxPrivateData } from '@/features/forms/logic';
import { EndpointConnectionManager } from '@/lib/endpoint';
import { Types } from '@simplito/privmx-webendpoint';
import { Utils } from '@simplito/privmx-webendpoint/extra';
import { InboxResourceEvent } from '@srs/InboxResourceEvent';

export class InboxResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;

    private inboxes() {
        return EndpointConnectionManager.getInstance().getInboxApi();
    }

    private async getInboxEventManager() {
        return await EndpointConnectionManager.getInstance().getInboxEventManager();
    }

    getName(): string {
        return 'InboxResource';
    }

    bind(ctx: AppContext, bus: AppEventBus) {
        this._ctx = ctx;
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', () => {
            this.setupEvents();
        });
        this._bus.registerSubscriber(subscriber);
        return this;
    }

    static inboxToForm(inbox: Types.Inbox): Form {
        const inboxInfo = Utils.deserializeObject(inbox.publicMeta) as InboxPrivateData;

        return {
            title: inboxInfo.name,
            managers: inbox.managers,
            users: inbox.users,
            creator: inbox.lastModifier,
            contextId: inbox.contextId,
            createDate: inbox.createDate,
            inboxId: inbox.inboxId
        };
    }

    async setupEvents() {
        const eventManager = await this.getInboxEventManager();

        await eventManager.onInboxEvent({
            event: 'inboxCreated',
            callback: (payload) => {
                const parsedInbox = InboxResource.inboxToForm(payload.data);
                this._bus.emit(InboxResourceEvent.newInbox(parsedInbox));
            }
        });

        await eventManager.onInboxEvent({
            event: 'inboxUpdated',
            callback: (payload) => {
                const parsedInbox = InboxResource.inboxToForm(payload.data);
                this._bus.emit(InboxResourceEvent.updatedInbox(parsedInbox));
            }
        });

        await eventManager.onInboxEvent({
            event: 'inboxDeleted',
            callback: (payload) => {
                this._bus.emit(InboxResourceEvent.deletedInbox(payload.data));
            }
        });
    }

    async getInboxList(page: number): Promise<{ inboxes: Form[]; total: number }> {
        const inboxList = await (
            await this.inboxes()
        ).listInboxes(this._ctx.user.contextId, {
            limit: 100,
            skip: 0,
            sortOrder: 'desc'
        });

        const deserializedInboxes: Form[] = inboxList.readItems.map((inbox) => {
            return InboxResource.inboxToForm(inbox);
        });
        return { inboxes: deserializedInboxes, total: inboxList.totalAvailable };
    }
}
