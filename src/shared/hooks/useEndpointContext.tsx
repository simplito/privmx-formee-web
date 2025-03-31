'use client';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useUserContext } from '../ui/context/UserContext';
import { EndpointConnectionManager } from '@/lib/endpoint';
import { Connection } from '@simplito/privmx-webendpoint';

const EndpointContext = createContext<Connection>(undefined);

export function useEndpointContext() {
    const ctx = useContext(EndpointContext);

    if (!ctx) {
        throw new Error('useEndPointContext can only be used in a EndpointContextProvider');
    }

    return ctx;
}

export function EndpointContextProvider({ children }: { children: ReactNode }) {
    const {
        state: { userStatus }
    } = useUserContext();
    const [context, setContext] = useState<Connection>();

    useEffect(() => {
        (async () => {
            if (userStatus === 'logged-in') {
                setContext(EndpointConnectionManager.getInstance().getConnection());
            } else {
                setContext(null);
            }
        })();
    }, [userStatus]);

    return <EndpointContext.Provider value={context}>{children}</EndpointContext.Provider>;
}
