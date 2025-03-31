import { AppEvent, Subscriber } from '@srs/AppBus';
import { InboxResponse } from '@/features/forms/data';

export class InboxEntryResourceSubscriber
    implements Subscriber<InboxEntryResourceEvent, InboxResourceEntryEventType>
{
    private callbacks: Map<
        InboxResourceEntryEventType['type'],
        Record<string, (event: InboxResourceEntryEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    add<E extends InboxResourceEntryEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                InboxResourceEntryEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const callbackSymbol = eventName;
        if (this.callbacks.has(eventName)) {
            const currentCallbacks = this.callbacks.get(eventName);
            // @ts-ignore
            this.callbacks.set(eventName, { ...currentCallbacks, [callbackSymbol]: callback });
        } else {
            // @ts-ignore
            this.callbacks.set(eventName, { [callbackSymbol]: callback });
        }
        return () => {
            const callbacks = this.callbacks.get(eventName);
            delete callbacks[callbackSymbol];
            return;
        };
    }

    notify(event: InboxEntryResourceEvent) {
        if (!this.callbacks.has(event.type)) return;
        const callbacks = this.callbacks.get(event.type);
        for (const cb of Object.values<(event: InboxResourceEntryEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type InboxResourceEntryEventType =
    | {
          type: 'created';
          payload: InboxResponse;
      }
    | {
          type: 'deleted';
          payload: { inboxId: string; entryId: string };
      };

export class InboxEntryResourceEvent implements AppEvent<InboxResourceEntryEventType> {
    public readonly payload: InboxResourceEntryEventType;
    public readonly scope: string;
    public readonly timestamp: number;

    public readonly type: InboxResourceEntryEventType['type'];

    static get eventName() {
        return 'InboxResourceEvent';
    }

    get eventName(): string {
        return InboxEntryResourceEvent.eventName;
    }

    constructor(resourceName: string, payload: InboxResourceEntryEventType) {
        this.payload = payload;
        this.scope = resourceName;
        this.type = payload.type;
    }

    static createSubscriber<E extends InboxResourceEntryEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                InboxResourceEntryEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const subscriber = new InboxEntryResourceSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: InboxResourceEntryEventType) => void);
        return subscriber;
    }

    static newEntry(payload: InboxResponse) {
        return new InboxEntryResourceEvent(this.eventName, { type: 'created', payload });
    }

    static deletedEntry(payload: { inboxId: string; entryId: string }) {
        return new InboxEntryResourceEvent(this.eventName, { type: 'deleted', payload });
    }
}
