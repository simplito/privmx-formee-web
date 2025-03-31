'use client';

import { CustomFile, InboxResponseQuestion } from '@/features/forms/data';
import { useNotification } from '@/shared/hooks/useNotification';
import { Blankslate } from '@atoms/blankslate';
import { SectionHeader } from '@atoms/section-header/SectionHeader';
import { Sheet } from '@atoms/sheet';
import { useFormContext } from '@/features/forms/logic';
import { useResponseGet } from '@/features/forms/logic/hooks/useResponseGet';
import {
    ActionIcon,
    Anchor,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Divider,
    Grid,
    Group,
    Loader,
    Paper,
    Skeleton,
    Stack,
    Text,
    ThemeIcon
} from '@mantine/core';
import { useResponseSystem } from '@srs/ReactBindings';
import { IconDownload, IconExclamationCircle, IconPaperclip } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Fragment, useCallback, useState } from 'react';

export default function ResponsePage({ params }: { params: { responseId: string } }) {
    const { response, status, getResponse } = useResponseGet(params.responseId);
    const inbox = useFormContext();

    if (status === 'loading') {
        return (
            <Stack maw={1500} mx={'auto'} w="100%">
                <SectionHeader title={'Form Anwers'}>
                    <Breadcrumbs>
                        <Anchor component={Link} href={'/'}>
                            Forms
                        </Anchor>
                        <Anchor component={Link} href={`/form/${inbox.inboxId}`}>
                            {inbox.title}
                        </Anchor>
                        <Text fw="bolder">{params.responseId.slice(0, 5)}</Text>
                    </Breadcrumbs>
                </SectionHeader>

                <Sheet h="100%" p="md" flex={1}>
                    <Stack w="80%" mx="auto">
                        {new Array(4).fill('').map((x, i) => (
                            <Fragment key={i}>
                                <Grid key={i} columns={3} py="md">
                                    <Grid.Col span={1}>
                                        <Skeleton w="auto" visible>
                                            <Text>Loading...</Text>
                                        </Skeleton>
                                    </Grid.Col>
                                    <Grid.Col span={2}>
                                        <Skeleton w="auto" visible>
                                            <Text>Loading...</Text>
                                        </Skeleton>
                                    </Grid.Col>
                                </Grid>
                                {i !== 3 && <Divider opacity={0.4} />}
                            </Fragment>
                        ))}
                    </Stack>
                </Sheet>
            </Stack>
        );
    }

    if (status === 'error') {
        return (
            <Stack flex={1}>
                <Blankslate
                    title="Unable to load answer details"
                    icon={<IconExclamationCircle size={32} />}
                    primaryAction={<Button onClick={() => getResponse()}>Retry</Button>}
                />
            </Stack>
        );
    }

    return (
        <Stack maw={1500} mx={'auto'} w="100%" px="md">
            <SectionHeader title={'Form Anwers'}>
                <Breadcrumbs>
                    <Anchor component={Link} href={'/'}>
                        Forms
                    </Anchor>
                    <Anchor component={Link} href={`/form/${inbox.inboxId}`}>
                        {inbox.title}
                    </Anchor>
                    <Text fw="bolder">{params.responseId.slice(0, 5)}</Text>
                </Breadcrumbs>
            </SectionHeader>

            <Sheet h="100%" p="md" flex={1}>
                <Stack w="100%" maw={1140} mx="auto" gap={0}>
                    {response.questions.map((x, i) => (
                        <Fragment key={x.id}>
                            <Box>
                                <Grid key={x.id} columns={3} py="md" align="center">
                                    <Grid.Col span={{ base: 3, md: 1 }}>
                                        <Text>{x.name}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 3, md: 2 }}>
                                        <FormResponseAnswer question={x} />
                                    </Grid.Col>
                                </Grid>
                                {i !== response.questions.length - 1 && <Divider opacity={0.4} />}
                            </Box>
                        </Fragment>
                    ))}
                    {response.files.length > 0 &&
                        <>
                            <Divider opacity={0.9} m={'md'} label={'Included files'} />
                            <Paper withBorder p="sm">
                                {response.files.map((file, i) => (
                                    <FileAttachment file={file} key={file.id} />
                                ))}
                            </Paper>
                        </>
                    }
                </Stack>
            </Sheet>
        </Stack>
    );
}

function bytesSize(size: number) {
    if (size <= 0) {
        return '0B';
    }

    const base = 1024;
    const exp = Math.floor(Math.log(size) / Math.log(base));
    const result = size / Math.pow(base, exp);
    const rounded = Math.round(Math.floor(result * 100) / 100);
    return rounded + ' ' + (exp === 0 ? '' : 'KMGTPEZY'[exp - 1]) + 'B';
}

function FormResponseAnswer({ question }: { question: InboxResponseQuestion }) {
    if (question.type === 'file') {
        return <></>;
    } else if (question.type === 'input') {
        return (
            <>
                {question.answers.map((answer) => {
                    return (
                        <Text key={answer.value} size="sm" c="dimmed">
                            {answer.value}
                        </Text>
                    );
                })}
            </>
        );
    } else {
        return (
            <Group
                key={question.name}
                gap={'xs'}
                style={{ overflow: 'clip', textOverflow: 'ellipsis' }}
                align="center">
                {question.answers.map((answer) => {
                    return (
                        <Badge
                            radius={'sm'}
                            tt="capitalize"
                            size="md"
                            miw="max-content"
                            key={answer.value}
                            color={answer.selected ? 'teal' : undefined}
                            variant="outline">
                            {answer.value}
                        </Badge>
                    );
                })}
            </Group>
        );
    }
}

function FileAttachment({ file }: { file: CustomFile }) {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const responseSystem = useResponseSystem();
    const { showError, showSuccess } = useNotification();
    const t = useTranslations();
    const downloadFile = useCallback(
        async (fileId: string, filename: string) => {
            setIsDownloading(true);

            try {
                await responseSystem.downloadFile(file.id, file.privateMeta.name);
                showSuccess(t('common.fileDownloadSuccess'));
            } catch (e) {
                console.log(e);
                showError(t('chat.chatFiles.error.errorDuringFileDownload'));
            } finally {
                setIsDownloading(false);
            }
        },
        [file.id, file.privateMeta.name, responseSystem, showError, t, showSuccess]
    );

    return (
        <Box key={file.id}>
            <Group gap={'xs'}>
                <ThemeIcon variant="transparent">
                    <IconPaperclip size={16} />
                </ThemeIcon>
                <Text size="sm">{file.privateMeta.name}</Text>
                <Text size="sm" c="dimmed">
                    {bytesSize(file.size)}
                </Text>
                <ActionIcon
                    onClick={() => downloadFile(file.id, file.privateMeta.name)}
                    variant="outline"
                    size={'sm'}
                    ml={'auto'}>
                    {isDownloading ? <Loader size={16} /> : <IconDownload size={16} />}
                </ActionIcon>
            </Group>
        </Box>
    );
}
