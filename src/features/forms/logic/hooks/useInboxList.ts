'use client';

import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { Form } from '..';
import { useApp, useFormSystem } from '@srs/ReactBindings';
import { InboxResourceEvent } from '@srs/InboxResourceEvent';

export const THREADS_PER_PAGE = 100;

export function useInboxList(navigate: (form: Form) => void) {
    const [status, setStatus] = useState<FormStatus>('loading');

    const formSystem = useFormSystem();
    const app = useApp();

    const [inboxes, setInboxes] = useState<Form[]>([]);

    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getInboxList = useCallback(
        async (page: number = 0) => {
            if (!hasMore) {
                return;
            }
            try {
                setStatus('loading');
                const { forms, hasMoreForms } = await formSystem.getFormList(page);
                setHasMore(hasMoreForms);

                if (startIndex === 0) {
                    setInboxes(forms);
                } else {
                    setInboxes((prev) => [...forms, ...prev]);
                }

                setStatus('success');
            } catch (e) {
                console.error(e);
                setStatus('error');
            }
        },
        [hasMore, startIndex, formSystem]
    );

    useEffect(() => {
        getInboxList();
    }, [getInboxList]);

    async function updateInboxList(inboxInfo: Form) {
        setInboxes((prev) => {
            const newThreads = [inboxInfo, ...prev];
            return newThreads;
        });
    }

    useEffect(() => {
        const s = InboxResourceEvent.createSubscriber('created', (form) => {
            updateInboxList(form.payload);
        });
        s.add('deleted', (form) => {
            setInboxes((prev) => {
                const newThreads = prev.filter((item) => item.inboxId !== form.payload.inboxId);
                return newThreads;
            });
        });

        const unsubInbox = app.eventBus.registerSubscriber(s);

        return () => {
            unsubInbox();
        };
    }, [app.eventBus, navigate]);

    const deleteInbox = useCallback(
        async (inboxId: string) => {
            const inbox = inboxes.find((inbox) => inbox.inboxId === inboxId);

            if (!inbox) {
                return;
            }
            setInboxes((prev) => {
                const newThreads = prev.filter((item) => item.inboxId !== inbox.inboxId);
                return newThreads;
            });
            await formSystem.deleteForm(inboxId);
        },
        [formSystem, inboxes]
    );

    return {
        inboxes,
        getInboxList,
        status,
        setStartIndex,
        startIndex,
        hasMore,
        deleteInbox
    };
}
