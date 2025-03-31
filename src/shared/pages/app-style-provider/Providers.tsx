'use client';

import { ReactNode } from 'react';
import { Notifications } from '@mantine/notifications';
import { App } from '@srs/App';
import { AppContextProvider } from '@srs/ReactBindings';
import { BrowserEventBus } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';
import { LoggerSystem } from '@srs/LoggerSystem';

import { UserSystem } from '@/features/users/logic/UserSystem';
import { AppStyleProvider } from './AppStyleProvider';
import { UserContextProvider } from '@/shared/ui/context/UserContext';
import { EndpointContextProvider } from '@/shared/hooks/useEndpointContext';
import { ModalsProvider } from '@mantine/modals';
import { InviteUserModal } from '@modals/invite-user-modal/InviteUserModal';
import { DomainConfigModal } from '@modals/domain-config-modal/DomainConfigModal';
import { CreateFormModal } from '@/features/forms/ui';
import { FormSystem, InboxResource, InboxService } from '@forms/logic';
import { ResponseSystem } from '@forms/logic/response-system/ResponseSystem';
import { ResponseResource } from '@forms/logic/response-system/ResponseResource';

const app = new App()
    .mountEventBus(new BrowserEventBus())
    .mountContext(new AppContext())
    .addResource(new InboxResource())
    .addResource(new ResponseResource())
    .addService(new InboxService())
    .addSystem(new FormSystem())
    .addSystem(new ResponseSystem())
    .addSystem(new UserSystem())
    .addSystem(new LoggerSystem());

const modals = {
    inviteUser: InviteUserModal,
    domainModal: DomainConfigModal,
    createForm: CreateFormModal
};

declare module '@mantine/modals' {
    export interface MantineModalsOverride {
        modals: typeof modals;
    }
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AppStyleProvider>
            <AppContextProvider app={app}>
                <UserContextProvider>
                    <EndpointContextProvider>
                        <ModalsProvider modals={modals}>{children}</ModalsProvider>
                        <Notifications limit={3} />
                    </EndpointContextProvider>
                </UserContextProvider>
            </AppContextProvider>
        </AppStyleProvider>
    );
}
