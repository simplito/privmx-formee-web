'use client';
import { AppShell, AppShellHeader, AppShellMain } from '@mantine/core';
import { Navbar } from '@pages/navbar/Navbar';
import { ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell bg="var(--mantine-color-app-body)" header={{ height: 70 }}>
            <AppShellHeader
                styles={{
                    header: {
                        marginBottom: 16,
                        border: 0,
                        backgroundColor: 'var(--mantine-color-app-body)'
                    }
                }}>
                <Navbar toggle={() => {}} />
            </AppShellHeader>

            <AppShellMain display={'flex'} style={{ flexDirection: 'column' }}>
                {children}
            </AppShellMain>
        </AppShell>
    );
}
