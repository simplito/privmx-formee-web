import { AuthGuard } from '@/shared/ui/atoms/auth-guard/AuthGuard';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useLocale } from 'next-intl';
import { AppLayout } from '@atoms/app-layout/AppLayout';
import { FormsList } from '@/features/forms/ui';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default function Home() {
    dayjs.locale(useLocale());
    return (
        <AuthGuard>
            <AppLayout>
                <FormsList />
            </AppLayout>
        </AuthGuard>
    );
}
