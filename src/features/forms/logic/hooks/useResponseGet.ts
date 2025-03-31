'use client';

import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { InboxResponse } from '@/features/forms/data';
import { useResponseSystem } from '@srs/ReactBindings';

export function useResponseGet(entryId: string) {
    const [status, setStatus] = useState<FormStatus>('loading');
    const [response, setResponse] = useState<InboxResponse>();
    const responseSystem = useResponseSystem();

    const getResponse = useCallback(async () => {
        try {
            setStatus('loading');

            const response = await responseSystem.getResponse(entryId);
            setResponse(response);
            setStatus('success');
        } catch {
            setStatus('error');
        }
    }, [responseSystem, entryId]);

    useEffect(() => {
        getResponse();
    }, [getResponse]);

    return {
        status,
        response,
        getResponse
    };
}
