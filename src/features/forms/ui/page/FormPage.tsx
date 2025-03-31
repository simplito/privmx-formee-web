'use client';

import { Blankslate } from '@atoms/blankslate';
import { LoadingState } from '@atoms/loading-state/LoadingState';
import { useFormContext } from '@/features/forms/logic';
import {
    Button,
    Code,
    CopyButton,
    Group,
    HoverCard,
    HoverCardDropdown,
    HoverCardTarget,
    List,
    Paper,
    Stack,
    Text,
    Title
} from '@mantine/core';
import { IconExclamationCircle, IconInfoCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { FormAnswers } from '../components/FormAnswers';
import { SectionHeader, SectionHeaderBackButton } from '@atoms/section-header/SectionHeader';
import { BRIDGE_URL, SOLUTION_ID } from '@utils/env';
import { useResponseList } from '@/features/forms/logic/hooks/useResponseList';
import { Sheet } from '@atoms/sheet';
import { useEffect, useRef } from 'react';
import { useApp } from '@srs/ReactBindings';
import { UserEvent } from '@srs/AppBus';

function emmbedValuesTemplate(formId: string, solutionId: string) {
    return `
formId:${formId}
solutionId:${solutionId}`;
}

export function FormPageView() {
    const { inboxId, title } = useFormContext();
    const { answers, getAnswersList, status } = useResponseList(inboxId);

    const t = useTranslations();
    const pageVisited = useRef(false);
    const app = useApp();

    useEffect(() => {
        if (!pageVisited.current) {
            app.eventBus.emit(UserEvent.pageEnter('form', inboxId));
            pageVisited.current = true;
        }

        return () => {
            app.eventBus.emit(UserEvent.pageLeave('form', inboxId));
        };
    }, [app.eventBus, inboxId]);

    if (status === 'loading') {
        return (
            <Stack flex={1} h="100%">
                <LoadingState title="Loading form responses" />
            </Stack>
        );
    }

    if (status === 'error') {
        return (
            <Stack flex={1}>
                <Blankslate
                    title="Unable to laod form answers"
                    icon={<IconExclamationCircle size={32} />}
                    primaryAction={<Button onClick={() => getAnswersList(0)}>Retry</Button>}
                />
            </Stack>
        );
    }

    return (
        <Stack maw={1500} mx={'auto'} mih={'80svh'} w="100%" px="md">
            <SectionHeader
                title={title}
                button={
                    <HoverCard position="bottom-end">
                        <HoverCardTarget>
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconInfoCircle size={16} />}>
                                Emmbedding
                            </Button>
                        </HoverCardTarget>
                        <HoverCardDropdown
                            p="lg"
                            style={{ border: 0, boxShadow: 'var(--mantine-shadow-sm)' }}>
                            <Title order={3}>Embbed Data</Title>
                            <Text size="sm" c="dimmed">
                                This values are used to submit data to this form
                            </Text>
                            <List my="sm" c="dimmed" size="sm">
                                <List.Item>
                                    Form ID :<CodeWithCopy value={inboxId} />
                                </List.Item>
                                <List.Item>
                                    Solution ID :<CodeWithCopy value={SOLUTION_ID} />
                                </List.Item>
                                <List.Item>
                                    Bridge URL :<CodeWithCopy value={BRIDGE_URL} />
                                </List.Item>
                            </List>

                            <CopyButton value={emmbedValuesTemplate(inboxId, SOLUTION_ID)}>
                                {({ copy, copied }) => (
                                    <Button
                                        onClick={copy}
                                        color={copied ? 'teal' : undefined}
                                        ml="auto"
                                        display={'block'}
                                        size="xs"
                                        variant="outline">
                                        Copy All
                                    </Button>
                                )}
                            </CopyButton>
                        </HoverCardDropdown>
                    </HoverCard>
                }>
                <SectionHeaderBackButton href={'/'}>{t('common.back')}</SectionHeaderBackButton>
            </SectionHeader>
            {answers.length > 0 ? (
                <FormAnswers responses={answers} status={status} />
            ) : (
                <Sheet w="100%" p="md" flex={1} display={'flex'} style={{ placeItems: 'center' }}>
                    <Paper h={'100%'} flex={1} maw={860} mx={'auto'}>
                        <Group h={'100%'} justify={'center'}>
                            <Stack>
                                <Title order={2}>There is no form answers yet</Title>
                                <Text ta="center" size={'sm'} c="dimmed">
                                    It looks like you haven&apos;t received any responses yet. Embed
                                    your form to start collecting answers.
                                </Text>
                                <Text c={'dimmed'} size={'sm'}>
                                    This values are used to submit data to this form
                                </Text>
                                <List c="dimmed" size="sm">
                                    <List.Item>
                                        Form ID: <CodeWithCopy value={inboxId} />
                                    </List.Item>
                                    <List.Item>
                                        Solution ID: <CodeWithCopy value={SOLUTION_ID} />
                                    </List.Item>
                                    <List.Item>
                                        Bridge URL: <CodeWithCopy value={BRIDGE_URL} />
                                    </List.Item>
                                </List>
                            </Stack>
                        </Group>
                    </Paper>
                </Sheet>
            )}
        </Stack>
    );
}

export function CodeWithCopy({ value }: { value: string }) {
    return (
        <CopyButton value={value}>
            {({ copy, copied }) => (
                <Code
                    maw={183}
                    style={{ cursor: 'pointer' }}
                    onClick={copy}
                    opacity={0.8}
                    color={copied ? 'teal' : undefined}>
                    {value}
                </Code>
            )}
        </CopyButton>
    );
}
