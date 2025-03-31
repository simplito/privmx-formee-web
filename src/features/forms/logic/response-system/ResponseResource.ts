import { InboxResponse } from '@/features/forms/data';
import { EndpointConnectionManager } from '@/lib/endpoint';
import { Resource } from '@srs/App';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';
import { InboxEntryResourceEvent } from '@srs/InboxEntryResourceEvent';
import { Types } from '@simplito/privmx-webendpoint';
import { downloadFile, Utils } from '@simplito/privmx-webendpoint/extra';

export class ResponseResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;
    getName = () => 'ResponseResource';
    private static PAGE_SIZE = 100;

    private async getInboxApi() {
        return await EndpointConnectionManager.getInstance().getInboxApi();
    }

    private async getInboxEventManager() {
        return await EndpointConnectionManager.getInstance().getInboxEventManager();
    }

    private eventCleanUpCallback: VoidFunction | null = null;

    bind(ctx: AppContext, bus: AppEventBus): Resource {
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', async () => {
            await this.setupEvents();
        });
        subscriber.add('sign_out', () => {
            this.eventCleanUpCallback?.();
        });
        this._bus.registerSubscriber(subscriber);
        this._ctx = ctx;
        return this;
    }

    static toFormResponse(entry: Types.InboxEntry): InboxResponse {
        const response = {
            ...Utils.deserializeObject(entry.data),
            createDate: entry.createDate,
            id: entry.entryId,
            files: entry.files.map((file) => {
                return {
                    id: file.info.fileId,
                    privateMeta: Utils.deserializeObject(file.privateMeta) as {
                        name: string;
                        type: string;
                    },
                    publicMeta: '',
                    size: file.size
                };
            })
        } as InboxResponse;
        return response;
    }

    private _currentSubscriptions: { formId: string; unsubscribe: () => Promise<void> }[] = [];

    async setupEvents() {
        const eventManager = await this.getInboxEventManager();

        const userSubscriber = UserEvent.createSubscriber('page_enter', async (page) => {
            if (page.formId === '') return;
            const removeEntryCreatedEvent = await eventManager.onEntryEvent(page.formId, {
                event: 'inboxEntryCreated',
                callback: (payload) => {
                    this._bus.emit(
                        InboxEntryResourceEvent.newEntry(
                            ResponseResource.toFormResponse(payload.data)
                        )
                    );
                }
            });

            const removeEntryDeletedEvent = await eventManager.onEntryEvent(page.formId, {
                event: 'inboxEntryDeleted',
                callback: (payload) => {
                    this._bus.emit(
                        InboxEntryResourceEvent.deletedEntry({
                            entryId: payload.data.entryId,
                            inboxId: payload.data.inboxId
                        })
                    );
                }
            });

            this._currentSubscriptions.push({
                formId: page.formId,
                unsubscribe: async () => {
                    await removeEntryCreatedEvent();
                    await removeEntryDeletedEvent();
                }
            });
        });
        userSubscriber.add('page_leave', (page) => {
            this._currentSubscriptions.forEach((subscription) => {
                if (subscription.formId === page.formId) {
                    this._currentSubscriptions = this._currentSubscriptions.filter(
                        (x) => x.formId !== page.formId
                    );
                    subscription.unsubscribe().then(() => {});
                }
            });
        });
        this.eventCleanUpCallback = this._bus.registerSubscriber(userSubscriber);
    }

    async getResponses(inboxId: string, page: number) {
        const api = await this.getInboxApi();
        const responseList = await api.listEntries(inboxId, {
            limit: ResponseResource.PAGE_SIZE,
            skip: ResponseResource.PAGE_SIZE * page,
            sortOrder: 'desc'
        });

        const responses: InboxResponse[] = responseList.readItems.map(
            ResponseResource.toFormResponse
        );
        return { responses, total: responseList.totalAvailable };
    }

    async getResponseById(entryId: string) {
        const api = await this.getInboxApi();
        const response = await api.readEntry(entryId);
        const parsedResponse = ResponseResource.toFormResponse(response);

        return parsedResponse;
    }

    async downloadFile(fileId: string, name: string) {
        const api = await EndpointConnectionManager.getInstance().getInboxApi();
        await downloadFile(api, fileId, name);
    }
}
