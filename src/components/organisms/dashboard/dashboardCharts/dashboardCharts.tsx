'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Brain, FolderTree, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks';
import { cn } from '@/lib';
import { getCategoryLabel } from '@/utilities';
import type {
  ChartCardProps,
  DashboardStats,
  KpiProps,
  KpiVariant,
} from '@/types';

export function DashboardCharts() {
  const t = useTranslations('dashboard');
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
        <Typography variant="large" className="text-base text-destructive">
          {t('loadFailed')}
        </Typography>
        <Typography variant="muted">
          {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </div>
    );
  }

  if (!data || data.totals.total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border/60 bg-card/40 p-12 text-center backdrop-blur">
        <Inbox className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <Typography variant="large" className="text-base">
          {t('empty.title')}
        </Typography>
        <Typography variant="muted" className="max-w-md">
          {t('empty.description')}
        </Typography>
      </div>
    );
  }

  return <Charts data={data} />;
}

function Charts({ data }: { data: DashboardStats }) {
  const tKpi = useTranslations('dashboard.kpi');
  const tCharts = useTranslations('dashboard.charts');
  const tCategories = useTranslations('categories');
  const { totals, byCategory, byBias, byMonth } = data;
  const topBiases = byBias.slice(0, 10);

  const localizedCategories = byCategory.map((item) => ({
    ...item,
    label: getCategoryLabel(item.category, tCategories),
  }));

  const categoryConfig: ChartConfig = {
    count: { label: tCharts('countLabel'), color: 'var(--chart-1)' },
  };
  const biasConfig: ChartConfig = {
    count: { label: tCharts('biasCountLabel'), color: 'var(--chart-2)' },
  };
  const monthConfig: ChartConfig = {
    count: { label: tCharts('countLabel'), color: 'var(--chart-4)' },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={tKpi('total')} value={totals.total} variant="total" />
        <Kpi
          label={tKpi('processing')}
          value={totals.processing}
          variant="processing"
        />
        <Kpi label={tKpi('done')} value={totals.done} variant="done" />
        <Kpi label={tKpi('errored')} value={totals.errored} variant="error" />
      </div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
        <div className="min-w-110 flex-1 snap-start">
          <ChartCard
            icon={<FolderTree className="size-4 text-chart-1" strokeWidth={1.5} />}
            title={tCharts('byCategory')}
            empty={byCategory.length === 0}
          >
            <ChartContainer config={categoryConfig} className="h-64 w-full">
              <BarChart data={localizedCategories} margin={{ left: -12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={6} />
              </BarChart>
            </ChartContainer>
          </ChartCard>
        </div>

        <div className="min-w-110 flex-1 snap-start">
          <ChartCard
            icon={<Activity className="size-4 text-chart-4" strokeWidth={1.5} />}
            title={tCharts('byMonth')}
            empty={byMonth.length === 0}
          >
            <ChartContainer config={monthConfig} className="h-64 w-full">
              <AreaChart data={byMonth} margin={{ left: -12 }}>
                <defs>
                  <linearGradient id="fillMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-count)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  fill="url(#fillMonth)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </ChartCard>
        </div>
      </div>

      <ChartCard
        icon={<Brain className="size-4 text-chart-2" strokeWidth={1.5} />}
        title={tCharts('byBias')}
        empty={topBiases.length === 0}
      >
        <ChartContainer config={biasConfig} className="h-72 w-full">
          <BarChart
            data={topBiases}
            layout="vertical"
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} fontSize={11} />
            <YAxis
              type="category"
              dataKey="bias"
              width={200}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={6} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </div>
  );
}

function Kpi({ label, value, variant }: KpiProps) {
  const styles: Record<KpiVariant, { card: string; label: string; value: string }> = {
    total: {
      card: 'bg-violet-600 text-white',
      label: 'text-violet-200',
      value: 'text-white',
    },
    processing: {
      card: 'bg-sky-100 text-sky-950',
      label: 'text-sky-700',
      value: 'text-sky-950',
    },
    done: {
      card: 'bg-emerald-100 text-emerald-950',
      label: 'text-emerald-700',
      value: 'text-emerald-950',
    },
    error: {
      card: 'bg-rose-100 text-rose-950',
      label: 'text-rose-700',
      value: 'text-rose-950',
    },
  };
  const s = styles[variant];

  return (
    <div className={cn('flex flex-col gap-2 rounded-2xl p-5', s.card)}>
      <Typography
        variant="muted"
        className={cn('font-mono text-xs tracking-wide', s.label)}
      >
        {label}
      </Typography>
      <span className={cn('text-4xl font-bold leading-none', s.value)}>
        {value}
      </span>
    </div>
  );
}

function ChartCard({ icon, title, empty, children }: ChartCardProps) {
  const t = useTranslations('common');
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/60 p-6">
      <header className="flex items-center gap-2">
        {icon}
        <Typography variant="large" className="text-base">
          {title}
        </Typography>
      </header>
      {empty ? (
        <Typography variant="muted" className="py-8 text-center text-sm">
          {t('noData')}
        </Typography>
      ) : (
        children
      )}
    </article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full lg:col-span-2" />
      </div>
    </div>
  );
}
