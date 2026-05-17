'use client';

import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DecisionCard } from '@/components/organisms/decision/decisionCard';
import { useDecisions } from '@/hooks';

const previewLimit = 2;

export function RecentDecisions() {
  const t = useTranslations('home.recent');
  const tList = useTranslations('decisions.list');
  const { data, isLoading, isError } = useDecisions({ limit: previewLimit });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Typography variant="h2" className="border-0 pb-0 text-2xl">
            {t('title')}
          </Typography>
          <Typography variant="muted" className="text-sm">
            {t('subtitle')}
          </Typography>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/decisions">
            {t('viewAll')}
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: previewLimit }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
          <Typography variant="muted" className="text-destructive">
            {tList('error')}
          </Typography>
        </div>
      )}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-card/40 p-10 text-center backdrop-blur">
          <FileText className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <Typography variant="large" className="text-base">
            {tList('empty.title')}
          </Typography>
          <Button asChild size="lg">
            <Link href="/decisions/new">
              {tList('empty.cta')}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-3">
          {data!.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );
}
