import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { DecisionForm } from '@/components/organisms';
import { getServerAuthStatus } from '@/utilities/getServerAuthStatus';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('decisions.new');
  return { title: t('title') };
}

export default async function NewDecisionPage() {
  const status = await getServerAuthStatus();
  if (status.isGuest && !status.canCreateDecision && status.firstDecisionId) {
    redirect(`/decisions/${status.firstDecisionId}`);
  }
  return <DecisionForm />;
}
