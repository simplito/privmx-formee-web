import { BindInfo, System } from '@srs/App';
import { UserEvent } from './AppBus';

export class LoggerSystem implements System {
    getName(): string {
        return 'LoggerSystem';
    }

    bind({ bus }: BindInfo) {
        const subscriber = UserEvent.createSubscriber('sign_in', (userContext) => {
            console.log('User signed in', userContext);
        });
        subscriber.add('page_enter', (page) => {
            console.log('Page enter', page, page.formId);
        });
        subscriber.add('page_leave', (page) => {
            console.log('Page leave', page, page.formId);
        });
        subscriber.add('sign_out', (userContext) => {
            console.log('User signed out', userContext);
        });

        bus.registerSubscriber(subscriber);

        return this;
    }
}
