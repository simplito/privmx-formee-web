'use client';
import {
    Grid,
    Stack,
    TextInput,
    Paper,
    ScrollArea,
    Group,
    Button,
    Checkbox,
    LoadingOverlay,
    Alert,
    Text,
    ActionIcon,
    ThemeIcon,
    Title
} from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { SelectableUser } from './SelectableUser';
import { FormEventHandler, useEffect } from 'react';
import useContactsGet from '@/lib/hooks/useContactsGet';
import { useTranslations } from 'next-intl';
import { IconListDetails, IconMessagePlus, IconUser, IconX } from '@tabler/icons-react';
import { useInputState } from '@mantine/hooks';
import { FormContainer } from '@atoms/form-container';
import { LoadingState } from '@atoms/loading-state/LoadingState';
import { SearchInput } from '@atoms/search-input/SearchInput';
import { InboxUsers, useInboxCreate } from '@/features/forms/logic';

export function CreateFormModal({
    context,
    id
}: // eslint-disable-next-line no-unused-vars
ContextModalProps<{}>) {
    const { contacts, status } = useContactsGet();
    const { createInbox, status: inboxStatus } = useInboxCreate();

    const t = useTranslations();
    useEffect(() => {
        if (inboxStatus === 'success') {
            modals.close(id);
        }
    }, [inboxStatus, id]);

    const [usersQuery, changeUsersQuerry] = useInputState('');

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name')?.toString() as string;

        const selectedCheckboxes: InboxUsers[] = [];

        const entries = Array.from(formData.entries());
        for (const pair of entries) {
            const [name, value] = pair;
            if (formData.getAll(name).length > 0 && name === 'users') {
                const data: InboxUsers = JSON.parse(value.toString());
                selectedCheckboxes.push(data);
            }
        }

        if (name && selectedCheckboxes.length >= 1) {
            await createInbox(selectedCheckboxes, name);
        }
    };

    return (
        <FormContainer>
            <ActionIcon
                variant="subtle"
                style={{ zIndex: 10 }}
                pos="absolute"
                top={16}
                right={16}
                onClick={() => context.closeModal(id)}>
                <IconX size={16} />
            </ActionIcon>
            <LoadingOverlay
                visible={inboxStatus === 'loading'}
                loaderProps={{
                    children: <LoadingState title={t('chat.modals.createChatModal.loading')} />
                }}
            />
            <FormContainer.LeftPanel></FormContainer.LeftPanel>
            <FormContainer.RightPanel>
                <Stack h="100%">
                    <form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                        }}
                        onSubmit={handleSubmit}>
                        <Group gap={4} align="center" mt="md">
                            <ThemeIcon variant="transparent" size={'sm'}>
                                <IconListDetails />
                            </ThemeIcon>
                            <Title order={3}>New Form</Title>
                        </Group>
                        <TextInput
                            data-autofocus
                            mb="lg"
                            name="name"
                            placeholder={'Create new Form'}
                            withAsterisk
                            size="lg"
                            required
                            styles={{
                                input: {
                                    border: 0,
                                    borderBottom: 'var(--mantine-border)',
                                    borderRadius: 0,
                                    padding: 'var(--mantine-spacing-sm)',
                                    paddingInline: 'var(--mantine-spacing-xs)'
                                }
                            }}
                        />

                        <Paper mb="sm" pos="relative" h="100%" w="100%">
                            <LoadingOverlay visible={status === 'loading'} />
                            {status === 'success' &&
                                contacts.length === 0 &&
                                t('chat.modals.createChatModal.noContacts')}

                            {status === 'success' && contacts.length > 0 && (
                                <Checkbox.Group>
                                    <Group gap={4} pr={'md'} pb={'xs'}>
                                        <ThemeIcon variant="transparent" size={'sm'}>
                                            <IconUser />
                                        </ThemeIcon>
                                        <Text fw="bold" size="sm">
                                            {t('chat.modals.createChatModal.members')}
                                        </Text>
                                    </Group>
                                    <SearchInput
                                        mb="sm"
                                        onChange={changeUsersQuerry}
                                        value={usersQuery}
                                        size="xs"
                                        style={{
                                            flexGrow: 1
                                        }}
                                    />
                                    <ScrollArea.Autosize mah={350} scrollbars="y">
                                        <Stack gap={'xs'} pos="relative">
                                            <Grid w="100%" align="center">
                                                {contacts.map((person) => {
                                                    return (
                                                        <SelectableUser
                                                            name="users"
                                                            key={person.username}
                                                            person={person}
                                                        />
                                                    );
                                                })}
                                            </Grid>
                                        </Stack>
                                    </ScrollArea.Autosize>
                                </Checkbox.Group>
                            )}

                            {status === 'error' && (
                                <Alert
                                    title={t('common.error') + '!'}
                                    color="red"
                                    style={{ margin: 'auto 0' }}>
                                    {t('chat.modals.createChatModal.errors.errorLoadingContacts')}
                                </Alert>
                            )}
                        </Paper>
                        <Group grow style={{ marginTop: 'auto' }}>
                            <Button type="submit" disabled={inboxStatus === 'loading'}>
                                {t('common.save')}
                            </Button>
                            <Button variant="light" onClick={() => context.closeModal(id)}>
                                {t('common.cancel')}
                            </Button>
                        </Group>
                    </form>
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
