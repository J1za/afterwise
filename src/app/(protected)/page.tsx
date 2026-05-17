import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeHero, RecentDecisions } from '@/components/organisms';
import { getServerAuthStatus } from '@/utilities/getServerAuthStatus';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('home') };
}

export default async function HomePage() {
  const status = await getServerAuthStatus();
  return (
    <div className="flex flex-col gap-10">
      <HomeHero isGuest={status.isGuest} />
      <RecentDecisions />
    </div>
  );
}
