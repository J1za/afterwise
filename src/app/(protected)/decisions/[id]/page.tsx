import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DecisionDetail } from '@/components/organisms';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('decisions.detail');
  return { title: t('title') };
}

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DecisionDetail id={id} />;
}
