'use client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Form } from '../form-system/types';
import { InboxResource } from '../form-system/InboxResource';
import { FormStatus } from '@utils/types';
import { Button, Stack } from '@mantine/core';
import { LoadingState } from '@atoms/loading-state/LoadingState';
import { Blankslate } from '@atoms/blankslate';
import { IconExclamationCircle } from '@tabler/icons-react';
import { EndpointConnectionManager } from '@/lib/endpoint';

const FormContext = createContext<Form | null>({
    contextId: '',
    createDate: 0,
    creator: '',
    inboxId: '',
    managers: [],
    users: [],
    title: ''
});

export function useFormContext() {
    const ctx = useContext(FormContext);

    if (!ctx) {
        throw new Error('useFormContext can only be used in a FormContextProvider');
    }

    return ctx;
}

export function FormContextProvider({ id, children }: { id: string; children: ReactNode }) {
    const [form, setForm] = useState<Form>(undefined);
    const [state, setState] = useState<FormStatus>('default');
    useEffect(() => {
        (async () => {
            try {
                setState('loading');
                const inboxClient = await EndpointConnectionManager.getInstance().getInboxApi();
                const info = await inboxClient.getInbox(id);
                const customInbox = InboxResource.inboxToForm(info);
                console.log(customInbox);
                setForm(customInbox);
                setState('success');
            } catch (error) {
                setState('error');
                console.error(error);
            }
        })();
    }, [id]);

    return (
        <FormContext.Provider value={form}>
            {state === 'loading' && (
                <Stack flex={1} h="100%">
                    <LoadingState title="Loadng Form" />
                </Stack>
            )}

            {state === 'error' && (
                <Stack flex={1}>
                    <Blankslate
                        title="Unable to laod form answers"
                        icon={<IconExclamationCircle size={32} />}
                        primaryAction={
                            <Button onClick={() => window.location.reload()}>
                                Refresh the page
                            </Button>
                        }
                    />
                </Stack>
            )}

            {state === 'success' && children}
        </FormContext.Provider>
    );
}
