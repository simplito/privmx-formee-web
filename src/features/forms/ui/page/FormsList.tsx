'use client';
import { Blankslate } from '@atoms/blankslate';
import { HoverableElement } from '@atoms/hoverable-element/HoverableElement';
import { LoadingState } from '@atoms/loading-state/LoadingState';
import { SectionHeader } from '@atoms/section-header/SectionHeader';
import { Sheet } from '@atoms/sheet';
import { Form, useInboxList } from '@/features/forms/logic';
import {
    Text,
    Stack,
    Paper,
    Grid,
    GridCol,
    AvatarGroup,
    Avatar,
    Group,
    ActionIcon,
    Button,
    Menu
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { MouseEventHandler, useCallback } from 'react';
import { useFormDelete } from '@forms/logic/hooks/useFormDelete';

export function FormsList() {
    const { status, inboxes, getInboxList } = useInboxList((a: Form) => {});
    const router = useRouter();

    if (status === 'loading') {
        return (
            <Stack p="md" w="100%" h="100%" mx="auto" maw={1500}>
                <LoadingState title="Loading Forms" />
            </Stack>
        );
    }

    if (status === 'error') {
        return (
            <Stack p="md" w="100%" h="100%" mx="auto" maw={1500}>
                <Blankslate
                    icon={<IconExclamationCircle />}
                    title="Error while downloading forms"
                    primaryAction={<Button onClick={() => getInboxList(0)}>Retry</Button>}
                />
            </Stack>
        );
    }

    return (
        <Stack w="100%" flex={1} mx="auto" maw={1500} px="md" pb="md">
            <SectionHeader
                title={'Your forms'}
                button={
                    <Button
                        onClick={() => {
                            modals.openContextModal({ modal: 'createForm', innerProps: {} });
                        }}>
                        New Form
                    </Button>
                }></SectionHeader>
            <Sheet w="100%" h="100%" p="md" flex={1}>
                <Paper p="xs" bg="gray.0" mb="xs">
                    <Grid>
                        <GridCol span={'auto'}>
                            <Text size="sm" c="dimmed">
                                Name
                            </Text>
                        </GridCol>
                        <GridCol span={2}>
                            <Text size="sm" c="dimmed">
                                Users
                            </Text>
                        </GridCol>
                        <GridCol span={1}></GridCol>
                    </Grid>
                </Paper>
                <Stack>
                    {inboxes.map((a) => (
                        <HoverableElement
                            key={a.inboxId}
                            p="sm"
                            data-no-shadow
                            onClick={() => {
                                router.push(`/form/${a.inboxId}`);
                            }}>
                            <Grid>
                                <GridCol span={'auto'}>
                                    <Text c="dimmed">{a.title}</Text>
                                </GridCol>
                                <GridCol span={2}>
                                    <AvatarGroup>
                                        {a.users.map((x, c) => (
                                            <Avatar key={c} size="sm">
                                                {x[0]}
                                            </Avatar>
                                        ))}
                                    </AvatarGroup>
                                </GridCol>
                                <GridCol span={1}>
                                    <FormActionsMenu form={a} />
                                </GridCol>
                            </Grid>
                        </HoverableElement>
                    ))}
                </Stack>
            </Sheet>
        </Stack>
    );
}

function FormActionsMenu({ form }: { form: Form }) {
    const { deleteForm, status } = useFormDelete();

    const onMenuItemClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            modals.openConfirmModal({
                title: `Delete the "${form.title}" form?`,
                children: (
                    <Text size="sm">
                        This action is irreversible, all form entries will be deleted alongside with
                        form.
                    </Text>
                ),
                confirmProps: { color: 'red', loading: status === 'loading' },
                labels: {
                    confirm: 'Delete Form',
                    cancel: 'Cancel'
                },
                onConfirm() {
                    deleteForm(form.inboxId).then(() => {});
                }
            });
        },
        [form.title, deleteForm, form.inboxId, status]
    );

    return (
        <Group w="100%" justify="flex-end">
            <Menu position={'bottom-end'}>
                <Menu.Target>
                    <ActionIcon
                        ml="auto"
                        variant="subtle"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}>
                        <IconDotsVertical size={16} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        color={'red'}
                        onClick={onMenuItemClick}
                        leftSection={<IconTrash size={16} />}>
                        Delete
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}
