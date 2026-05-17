'use client';

import type { Route } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BarChart3,
  Brain,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useDecisions } from '@/hooks';
import { cn } from '@/lib';
import { getCategoryLabel } from '@/utilities';
import type {
  DetailStatCardProps,
  HeroCardProps,
  HomeHeroProps,
  LatestDecisionCardProps,
  NewCtaCardProps,
  StatRowProps,
  TopBiasCardProps,
  TotalCardProps,
} from '@/types';

export function HomeHero({ isGuest = false }: HomeHeroProps) {
  const t = useTranslations('home.hero');
  const tCategories = useTranslations('categories');
  const stats = useDashboardStats();
  const recent = useDecisions({ limit: 1 });

  const latest = recent.data?.[0];
  const total = stats.data?.totals.total ?? 0;
  const totals = stats.data?.totals;
  const topBias = stats.data?.byBias[0];
  const isLoadingLatest = recent.isLoading;
  const isLoadingStats = stats.isLoading;

  return (
    <div className="grid grid-cols-1 gap-4 md:auto-rows-min md:grid-cols-4">
      <LatestDecisionCard
        latest={latest}
        isLoading={isLoadingLatest}
        translateCategory={tCategories}
        labels={{
          label: t('latest.label'),
          categoryLabel: t('latest.categoryLabel'),
          empty: t('latest.empty'),
          emptySubtitle: t('latest.emptySubtitle'),
          cta: t('latest.cta'),
        }}
      />

      <TotalCard
        total={total}
        isLoading={isLoadingStats}
        label={t('total.label')}
        subtitle={t('total.subtitle')}
      />

      <NewCtaCard
        title={t('newCta.title')}
        subtitle={t('newCta.subtitle')}
        button={t('newCta.button')}
      />

      {!isGuest && (
        <DetailStatCard
          totals={totals}
          isLoading={isLoadingStats}
          labels={{
            label: t('detail.label'),
            subtitle: t('detail.subtitle'),
            done: t('detail.done'),
            processing: t('detail.processing'),
            errored: t('detail.errored'),
          }}
        />
      )}

      <TopBiasCard
        bias={topBias}
        isLoading={isLoadingStats}
        label={t('topBias.label')}
        empty={t('topBias.empty')}
      />
    </div>
  );
}

function LatestDecisionCard({
  latest,
  isLoading,
  translateCategory,
  labels,
}: LatestDecisionCardProps) {
  const cardClass =
    'bg-violet-600 text-white md:col-span-2 md:row-span-2';
  const labelClass = 'text-violet-200';

  if (isLoading) {
    return (
      <HeroCard
        className={cardClass}
        label={labels.label}
        labelClassName={labelClass}
      >
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-3/4 bg-white/20" />
          <Skeleton className="h-6 w-1/2 bg-white/20" />
        </div>
      </HeroCard>
    );
  }

  if (!latest) {
    return (
      <HeroCard
        className={cardClass}
        label={labels.label}
        labelClassName={labelClass}
      >
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div>
            <Typography
              variant="h3"
              className="border-0 pb-0 text-xl leading-tight font-bold text-white md:text-2xl"
            >
              {labels.empty}
            </Typography>
            <Typography variant="p" className="mt-2 text-sm text-violet-200">
              {labels.emptySubtitle}
            </Typography>
          </div>
          <Button asChild variant="secondary" className="self-start">
            <Link href="/decisions/new">
              <Sparkles className="size-4" strokeWidth={1.75} />
              {labels.cta}
            </Link>
          </Button>
        </div>
      </HeroCard>
    );
  }

  return (
    <HeroCard
      className={cn(cardClass, 'transition-colors hover:bg-violet-500')}
      label={labels.label}
      labelClassName={labelClass}
      href={`/decisions/${latest.id}` as Route}
      action={
        <span className="rounded-full bg-white/15 p-1.5 transition-colors group-hover/hero:bg-white/25">
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </span>
      }
    >
      <Brain
        aria-hidden
        strokeWidth={1.25}
        className="pointer-events-none absolute -right-8 -bottom-12 size-64 text-violet-300/30 transition-transform duration-500 group-hover/hero:scale-110 group-hover/hero:rotate-6"
      />
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        <Typography
          variant="h3"
          className="line-clamp-6 border-0 pb-0 text-lg leading-snug font-semibold text-white md:text-xl"
        >
          {latest.situation}
        </Typography>
        {latest.analysis?.category && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-sm">
            <span className="font-mono text-violet-200">
              {labels.categoryLabel}:
            </span>
            <span className="font-medium">
              {getCategoryLabel(latest.analysis.category, translateCategory)}
            </span>
          </span>
        )}
      </div>
    </HeroCard>
  );
}

function TotalCard({ total, isLoading, label, subtitle }: TotalCardProps) {
  return (
    <HeroCard
      className="bg-sky-100 text-sky-950 md:col-span-1 md:row-span-1 md:col-start-3 md:row-start-1"
      label={label}
      labelClassName="text-sky-700"
      action={
        <TrendingUp className="size-5 text-sky-700" strokeWidth={1.75} />
      }
    >
      <div className="flex items-end justify-between gap-3">
        {isLoading ? (
          <Skeleton className="h-12 w-20 bg-sky-200" />
        ) : (
          <Typography
            variant="h2"
            className="border-0 pb-0 text-5xl leading-none font-bold text-sky-950"
          >
            {total}
          </Typography>
        )}
        <span className="font-mono text-xs text-sky-700">{subtitle}</span>
      </div>
    </HeroCard>
  );
}

function NewCtaCard({ title, subtitle, button }: NewCtaCardProps) {
  return (
    <HeroCard
      className="bg-zinc-900 text-white md:col-span-1 md:row-span-1 md:col-start-4 md:row-start-1"
      label={title}
      labelClassName="text-zinc-400"
    >
      <div className="flex flex-1 flex-col justify-between gap-6">
        <Typography variant="p" className="text-sm text-zinc-300">
          {subtitle}
        </Typography>
        <Button asChild size="lg" className="w-full justify-between">
          <Link href="/decisions/new">
            <span className="flex items-center gap-2">
              <Plus className="size-4" strokeWidth={2} />
              {button}
            </span>
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </Link>
        </Button>
      </div>
    </HeroCard>
  );
}

function TopBiasCard({ bias, isLoading, label, empty }: TopBiasCardProps) {
  return (
    <HeroCard
      className="bg-amber-300 text-amber-950 md:col-span-1 md:row-span-1 md:col-start-3 md:row-start-2"
      label={label}
      labelClassName="text-amber-800"
    >
      {isLoading ? (
        <Skeleton className="h-8 w-3/4 bg-amber-200" />
      ) : bias ? (
        <div className="flex items-end justify-between gap-3">
          <Typography
            variant="h3"
            className="border-0 pb-0 text-xl leading-tight font-bold text-amber-950"
          >
            {truncate(bias.bias, 32)}
          </Typography>
          <span className="rounded-full bg-amber-950/10 px-2.5 py-1 font-mono text-xs text-amber-900">
            ×{bias.count}
          </span>
        </div>
      ) : (
        <Typography variant="p" className="text-sm text-amber-800">
          {empty}
        </Typography>
      )}
    </HeroCard>
  );
}

function DetailStatCard({ totals, isLoading, labels }: DetailStatCardProps) {
  return (
    <HeroCard
      className="bg-emerald-100 text-emerald-950 transition-colors md:col-span-1 md:row-span-1 md:col-start-4 md:row-start-2 hover:bg-emerald-200"
      label={labels.label}
      labelClassName="text-emerald-700"
      href={'/dashboard' as Route}
      action={
        <span className="rounded-full bg-emerald-700/15 p-1.5 transition-colors group-hover/hero:bg-emerald-700/25">
          <BarChart3 className="size-4 text-emerald-800" strokeWidth={1.75} />
        </span>
      }
    >
      <div className="flex flex-1 flex-col justify-between gap-4">
        <Typography variant="p" className="text-sm text-emerald-700">
          {labels.subtitle}
        </Typography>
        <div className="flex flex-col gap-2.5">
          <StatRow
            label={labels.done}
            value={totals?.done ?? 0}
            isLoading={isLoading}
            dotClassName="bg-emerald-600"
          />
          <StatRow
            label={labels.processing}
            value={totals?.processing ?? 0}
            isLoading={isLoading}
            dotClassName="bg-amber-500"
          />
          <StatRow
            label={labels.errored}
            value={totals?.errored ?? 0}
            isLoading={isLoading}
            dotClassName="bg-rose-500"
          />
        </div>
      </div>
    </HeroCard>
  );
}

function StatRow({ label, value, isLoading, dotClassName }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={cn('inline-block size-2 rounded-full', dotClassName)} />
        <span>{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-4 w-6 bg-emerald-200" />
      ) : (
        <span className="font-mono font-semibold">{value}</span>
      )}
    </div>
  );
}

function HeroCard({
  className,
  label,
  labelClassName,
  action,
  href,
  children,
}: HeroCardProps) {
  const content = (
    <>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className={cn('font-mono text-xs', labelClassName)}>{label}</span>
        {action}
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </>
  );

  const baseClass =
    'group/hero relative flex min-h-32 flex-col gap-4 overflow-hidden rounded-2xl p-6';

  if (href) {
    return (
      <Link href={href} className={cn(baseClass, className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn(baseClass, className)}>{content}</div>;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
