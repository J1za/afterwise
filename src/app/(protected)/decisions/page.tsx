import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { DecisionsList } from '@/components/organisms';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('decisions.list');
  return { title: t('title') };
}

export default async function DecisionsPage() {
  const t = await getTranslations('decisions.list');
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Typography variant="h1" className="text-4xl">
            {t('title')}
          </Typography>
          <Typography variant="lead" className="max-w-2xl">
            {t('subtitle')}
          </Typography>
        </div>
        <Button asChild size="lg">
          <Link href="/decisions/new">
            {t('newCta')}
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <DecisionsList />
    </div>
  );
}
