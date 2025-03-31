'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { App } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEvent } from '@srs/AppBus';
import { UserSystem } from '@/features/users/logic/UserSystem';
import { FormSystem } from '@/features/forms/logic';
import { ResponseSystem } from '@/features/forms/logic/response-system/ResponseSystem';

const appContext = createContext<App>(new App());

export const useApp = () => useContext(appContext);

export function useEmitEvent() {
    const app = useContext(appContext);
    const emitEvent = <T extends any>(event: AppEvent<T>) => {
        app.eventBus.emit(event);
    };

    return emitEvent;
}

export function useUserSystem() {
    const app = useApp();
    const system = app.systems.get('UserSystem') as UserSystem;

    if (!system) {
        throw new Error('No registered system with name ' + 'UserSystem');
    }

    return system;
}

export function useFormSystem() {
    const app = useApp();
    const system = app.systems.get('FormSystem') as FormSystem;

    if (!system) {
        throw new Error('No registered system with name ' + 'FormSystem');
    }

    return system;
}

export function useResponseSystem() {
    const app = useApp();
    const system = app.systems.get('ResponseSystem') as ResponseSystem;

    if (!system) {
        throw new Error('No registered system with name ' + 'ResponseSystem');
    }

    return system;
}

export function useAppContext() {
    const app = useContext(appContext);
    const [context, setContext] = useState<AppContext>();

    useEffect(() => {
        const system = app.context;
        setContext(system);
    }, [app.context]);

    return context;
}

export function AppContextProvider({ app, children }: { app: App; children: ReactNode }) {
    return <appContext.Provider value={app}>{children}</appContext.Provider>;
}
