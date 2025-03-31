import { AppLayout } from '@atoms/app-layout/AppLayout';
import { AuthGuard } from '@atoms/auth-guard/AuthGuard';
import { FormContextProvider } from '@/features/forms/logic';
import { ReactNode } from 'react';

export default function FormLayout({
    children,
    params
}: {
    children: ReactNode;
    params: { formId: string };
}) {
    return (
        <AppLayout>
            <AuthGuard>
                <FormContextProvider id={params.formId}>{children}</FormContextProvider>
            </AuthGuard>
        </AppLayout>
    );
}
