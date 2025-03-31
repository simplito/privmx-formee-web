'use client';

import { useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { useFormSystem } from '@srs/ReactBindings';
import { InboxUsers } from '../form-system/types';

export interface LastReadMessageFileContent {
    lastReadMessageDate: number;
}

export function useInboxCreate() {
    const [status, setStatus] = useState<FormStatus>('default');

    const c = useFormSystem();

    async function createInbox(users: InboxUsers[], title: string) {
        try {
            setStatus('loading');
            const form = await c.createForm(title, users);
            setStatus('success');
            return form;
        } catch (e) {
            console.error(e);
            setStatus('error');
            return null;
        }
    }

    return {
        createInbox,
        status
    };
}
