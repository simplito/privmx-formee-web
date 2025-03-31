'use client';

import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { InboxResponse } from '@/features/forms/data';
import { useApp, useResponseSystem } from '@srs/ReactBindings';
import { InboxEntryResourceEvent } from '@srs/InboxEntryResourceEvent';

export function useResponseList(inboxId: string) {
    const [status, setStatus] = useState<FormStatus>('loading');
    const [answers, setAnswers] = useState<InboxResponse[]>([]);
    const responseSystem = useResponseSystem();
    const app = useApp();

    const getAnswersList = useCallback(
        async (page: number = 0) => {
            try {
                setStatus('loading');

                const anwsers = await responseSystem.getResponseList(inboxId, page);

                setAnswers(anwsers.responses);

                setStatus('success');
            } catch {
                setStatus('error');
            }
        },
        [inboxId, responseSystem]
    );

    function updateAnswersList(newResponse: InboxResponse) {
        setAnswers((prev) => {
            const newReponses = [newResponse, ...prev];
            return newReponses;
        });
    }

    useEffect(() => {
        const s = InboxEntryResourceEvent.createSubscriber('created', (form) => {
            updateAnswersList(form.payload);
        });

        const unsubRepsonse = app.eventBus.registerSubscriber(s);

        return () => {
            unsubRepsonse();
        };
    }, [app.eventBus]);

    useEffect(() => {
        void getAnswersList();
    }, [getAnswersList]);

    return {
        status,
        answers: answers,
        getAnswersList: getAnswersList
    };
}
