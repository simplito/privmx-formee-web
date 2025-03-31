'use client';

import { useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { useFormSystem } from '@srs/ReactBindings';

export interface LastReadMessageFileContent {
    lastReadMessageDate: number;
}

export function useFormDelete() {
    const [status, setStatus] = useState<FormStatus>('default');

    const c = useFormSystem();

    async function deleteForm(inboxId: string) {
        try {
            setStatus('loading');
            await c.deleteForm(inboxId);
            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    }

    return {
        deleteForm,
        status
    };
}
