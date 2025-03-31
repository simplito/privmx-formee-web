import { AppEvent, Subscriber } from '@srs/AppBus';
import { Form } from '@/features/forms/logic/form-system/types';

export class InboxResourceSubscriber
    implements Subscriber<InboxResourceEvent, InboxResourceEventType>
{
    private callbacks: Map<
        InboxResourceEventType['type'],
        Record<string, (event: InboxResourceEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    add<E extends InboxResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                InboxResourceEventType,
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

    notify(event: InboxResourceEvent) {
        if (!this.callbacks.has(event.type)) return;
        const callbacks = this.callbacks.get(event.type);
        for (const cb of Object.values<(event: InboxResourceEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type InboxResourceEventType =
    | {
          type: 'created';
          payload: Form;
      }
    | {
          type: 'updated';
          payload: Form;
      }
    | {
          type: 'deleted';
          payload: { inboxId: string };
      };

export class InboxResourceEvent implements AppEvent<InboxResourceEventType> {
    public readonly payload: InboxResourceEventType;
    public readonly scope: string;
    public readonly timestamp: number;

    public readonly type: InboxResourceEventType['type'];

    static get eventName() {
        return 'InboxResourceEvent';
    }

    get eventName(): string {
        return InboxResourceEvent.eventName;
    }

    constructor(resourceName: string, payload: InboxResourceEventType) {
        this.payload = payload;
        this.scope = resourceName;
        this.type = payload.type;
    }

    static createSubscriber<E extends InboxResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                InboxResourceEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const subscriber = new InboxResourceSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: InboxResourceEventType) => void);
        return subscriber;
    }

    static newInbox(payload: Form) {
        return new InboxResourceEvent(this.eventName, { type: 'created', payload });
    }

    static updatedInbox(payload: Form) {
        return new InboxResourceEvent(this.eventName, { type: 'updated', payload });
    }

    static deletedInbox(payload: { inboxId: string }) {
        return new InboxResourceEvent(this.eventName, { type: 'deleted', payload });
    }
}
