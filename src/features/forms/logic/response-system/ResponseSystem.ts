import { BindInfo, System } from '@srs/App';
import { AppEventBus } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';
import { ResponseResource } from './ResponseResource';

export class ResponseSystem implements System {
    private responseResource: ResponseResource;

    private bus: AppEventBus;
    private context: AppContext;
    private INBOXES_PER_PAGE = 100;

    bind({ resources, services, bus }: BindInfo) {
        if (resources.has('InboxResource')) {
            this.responseResource = resources.get('ResponseResource') as ResponseResource;
        }

        this.bus = bus;
        return this;
    }

    static get systemName() {
        return 'ResponseSystem';
    }

    static isResponseSystem(system: System): system is ResponseSystem {
        return system.getName() === ResponseSystem.systemName;
    }

    getName(): string {
        return ResponseSystem.systemName;
    }

    async getResponseList(inboxId: string, page: number) {
        const responseList = await this.responseResource.getResponses(inboxId, page);
        const hasMoreResponses = responseList.responses.length === this.INBOXES_PER_PAGE;

        return { hasMoreResponses, responses: responseList.responses };
    }

    async getResponse(entryId: string) {
        const response = await this.responseResource.getResponseById(entryId);

        return response;
    }

    async downloadFile(fileId: string, fileName: string) {
        await this.responseResource.downloadFile(fileId, fileName);
    }
}
