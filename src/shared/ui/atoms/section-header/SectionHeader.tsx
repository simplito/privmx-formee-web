import { Box, Button, Flex, Group, Title } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

export function SectionHeader({
    button,
    children,
    title
}: {
    button?: ReactNode;
    title: string;
    children?: ReactNode;
}) {
    return (
        <Box mt="xl">
            <Flex align={'center'} h={36}>
                {children}
            </Flex>
            <Group justify="space-between" align="flex-end">
                <Title>{title}</Title>
                {button}
            </Group>
        </Box>
    );
}

export function SectionHeaderBackButton({
    children,
    ...props
}: { children: ReactNode } & LinkProps) {
    return (
        <Button
            component={Link}
            {...props}
            display={'inline-flex'}
            pl={0}
            variant="transparent"
            leftSection={<IconChevronLeft size={'1rem'} />}>
            {children}
        </Button>
    );
}
