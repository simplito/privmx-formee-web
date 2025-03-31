import { BindInfo, System } from '@srs/App';
import { AppEventBus } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';
import { InboxResource } from './InboxResource';
import { InboxService } from './InboxService';
import { InboxUsers } from './types';

export class FormSystem implements System {
    private inboxResource: InboxResource;
    private inboxService: InboxService;

    private bus: AppEventBus;
    private context: AppContext;
    private INBOXES_PER_PAGE = 100;

    bind({ resources, services, bus }: BindInfo) {
        if (resources.has('InboxResource')) {
            this.inboxResource = resources.get('InboxResource') as InboxResource;
        }
        if (services.has('InboxService')) {
            this.inboxService = services.get('InboxService') as InboxService;
        }

        this.bus = bus;
        return this;
    }

    static get systemName() {
        return 'FormSystem';
    }

    static isFormSystem(system: System): system is FormSystem {
        return system.getName() === FormSystem.systemName;
    }

    getName(): string {
        return FormSystem.systemName;
    }

    async getFormList(page: number) {
        const inboxList = await this.inboxResource.getInboxList(page);
        const hasMoreForms = inboxList.inboxes.length === this.INBOXES_PER_PAGE;

        return { hasMoreForms, forms: inboxList.inboxes };
    }

    async createForm(formName: string, users: InboxUsers[]) {
        const form = await this.inboxService.createInbox({ title: formName, users });
        return form;
    }

    async deleteForm(chatId: string) {
        await this.inboxService.deleteInbox(chatId);
    }
}
