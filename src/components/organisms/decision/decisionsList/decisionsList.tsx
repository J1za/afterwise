'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, FileText, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDecisions, useUsedCategories } from '@/hooks';
import { DecisionFilters } from '@/components/molecules';
import { DecisionCard } from '@/components/organisms/decision/decisionCard';
import type {
  DecisionListSort,
  DecisionStatus,
  DecisionsListEmptyStateProps,
} from '@/types';

function isStatusValue(value: string): value is DecisionStatus {
  return value === 'processing' || value === 'done' || value === 'error';
}

export function DecisionsList() {
  const t = useTranslations('decisions.list');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<DecisionListSort>('newest');

  const { data: usedCategories = [] } = useUsedCategories();

  const effectiveCategory =
    category === 'all' || usedCategories.includes(category) ? category : 'all';

  const hasFilters =
    status !== 'all' || effectiveCategory !== 'all' || sort !== 'newest';

  const { data, isLoading, isError, error } = useDecisions({
    status: isStatusValue(status) ? status : undefined,
    category: effectiveCategory !== 'all' ? effectiveCategory : undefined,
    sort,
  });

  function reset() {
    setStatus('all');
    setCategory('all');
    setSort('newest');
  }

  const decisions = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <DecisionFilters
        status={status}
        category={effectiveCategory}
        sort={sort}
        categories={usedCategories}
        onChange={({ status: s, category: c, sort: srt }) => {
          if (s !== undefined) setStatus(s);
          if (c !== undefined) setCategory(c);
          if (srt !== undefined) setSort(srt);
        }}
        onReset={reset}
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
          <Typography variant="large" className="text-base text-destructive">
            {t('error')}
          </Typography>
          <Typography variant="muted">
            {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
        </div>
      )}

      {!isLoading && !isError && decisions.length === 0 && (
        <EmptyState hasFilters={hasFilters} onReset={reset} />
      )}

      {!isLoading && !isError && decisions.length > 0 && (
        <div className="flex flex-col gap-3">
          {decisions.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onReset }: DecisionsListEmptyStateProps) {
  const t = useTranslations('decisions.list');

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-card/40 p-12 text-center backdrop-blur">
        <Inbox className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="large" className="text-base">
          {t('emptyFiltered.title')}
        </Typography>
        <Typography variant="muted">
          {t('emptyFiltered.description')}
        </Typography>
        <Button variant="ghost" size="sm" onClick={onReset}>
          {t('emptyFiltered.cta')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-card/40 p-12 text-center backdrop-blur">
      <FileText className="size-8 text-muted-foreground" strokeWidth={1.5} />
      <Typography variant="large" className="text-base">
        {t('empty.title')}
      </Typography>
      <Typography variant="muted" className="max-w-md">
        {t('empty.description')}
      </Typography>
      <Button asChild size="lg">
        <Link href="/decisions/new">
          {t('empty.cta')}
          <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
