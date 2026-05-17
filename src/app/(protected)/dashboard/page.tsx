import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/atoms';
import { DashboardCharts } from '@/components/organisms';
import { getServerAuthStatus } from '@/utilities/getServerAuthStatus';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');
  return { title: t('title') };
}

export default async function DashboardPage() {
  const status = await getServerAuthStatus();
  if (status.isGuest) redirect('/decisions');

  const t = await getTranslations('dashboard');
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Typography variant="h1" className="text-4xl">
          {t('title')}
        </Typography>
        <Typography variant="lead" className="max-w-2xl">
          {t('subtitle')}
        </Typography>
      </div>
      <DashboardCharts />
    </div>
  );
}
