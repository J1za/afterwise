'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatusBadge, Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDecision, useRetryAnalysis } from '@/hooks';
import { formatDateTime, getCategoryLabel } from '@/utilities';
import { AnalysisView } from '@/components/organisms/decision/analysisView';
import type {
  DecisionDetailProps,
  DecisionErrorBlockProps,
  DecisionFailureBlockProps,
  DecisionSectionProps,
} from '@/types';

export function DecisionDetail({ id }: DecisionDetailProps) {
  const t = useTranslations('decisions.detail');
  const tCategories = useTranslations('categories');
  const { data: decision, isLoading, isError, error } = useDecision(id);
  const retry = useRetryAnalysis(id);

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    return (
      <FailureBlock
        title={t('loadFailed')}
        message={error instanceof Error ? error.message : 'Unknown error'}
      />
    );
  }

  if (!decision) {
    return (
      <FailureBlock
        title={t('notFound.title')}
        message={t('notFound.description')}
      />
    );
  }

  const isProcessing = decision.status === 'processing';
  const isErrored = decision.status === 'error';
  const title = decision.analysis?.category
    ? t('titleWithCategory', {
        category: getCategoryLabel(decision.analysis.category, tCategories),
      })
    : t('title');

  return (
    <div className="flex flex-col gap-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5">
        <Link href="/decisions">
          <ArrowLeft className="size-3.5" strokeWidth={1.5} />
          {t('back')}
        </Link>
      </Button>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={decision.status} />
          <Typography variant="muted" className="font-mono text-xs">
            {formatDateTime(decision.createdAt)}
          </Typography>
        </div>
        <Typography variant="h1" className="text-4xl">
          {title}
        </Typography>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section labelKey="situation" body={decision.situation} />
        <Section labelKey="decision" body={decision.decision} />
        {decision.reasoning && (
          <Section labelKey="reasoning" body={decision.reasoning} wide />
        )}
      </div>

      {isProcessing && <ProcessingBlock />}

      {isErrored && (
        <ErrorBlock
          message={decision.errorMessage}
          onRetry={() => retry.mutate()}
          isRetrying={retry.isPending}
        />
      )}

      {decision.analysis && <AnalysisView analysis={decision.analysis} />}

      {decision.analysis && !isProcessing && !isErrored && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => retry.mutate()}
            disabled={retry.isPending}
          >
            {retry.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" strokeWidth={1.5} />
            )}
            {t('retry')}
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({ labelKey, body, wide }: DecisionSectionProps) {
  const t = useTranslations('decisions.detail.section');
  return (
    <article
      className={
        'flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-6 backdrop-blur' +
        (wide ? ' lg:col-span-2' : '')
      }
    >
      <Typography
        variant="muted"
        className="font-mono text-xs uppercase tracking-wide"
      >
        {t(labelKey)}
      </Typography>
      <Typography
        variant="p"
        className="whitespace-pre-wrap leading-relaxed first:mt-0"
      >
        {body}
      </Typography>
    </article>
  );
}

function ProcessingBlock() {
  const t = useTranslations('decisions.detail.processing');
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-6 backdrop-blur">
      <Loader2
        className="size-5 animate-spin text-status-processing"
        strokeWidth={1.5}
      />
      <div className="flex flex-col gap-1">
        <Typography variant="large" className="text-base">
          {t('title')}
        </Typography>
        <Typography variant="muted" className="text-sm">
          {t('description')}
        </Typography>
      </div>
    </div>
  );
}

function ErrorBlock({ message, onRetry, isRetrying }: DecisionErrorBlockProps) {
  const t = useTranslations('decisions.detail.error');
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <div className="flex flex-col gap-2">
        <Typography variant="large" className="text-base text-destructive">
          {t('title')}
        </Typography>
        <Typography variant="muted" className="text-sm">
          {message ?? t('noDetails')}
        </Typography>
      </div>
      <div>
        <Button onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" strokeWidth={1.5} />
          )}
          {t('retry')}
        </Button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function FailureBlock({ title, message }: DecisionFailureBlockProps) {
  const t = useTranslations('decisions.detail');
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6">
      <Typography variant="large" className="text-base text-destructive">
        {title}
      </Typography>
      <Typography variant="muted">{message}</Typography>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/decisions">
          <ArrowLeft className="size-3.5" />
          {t('back')}
        </Link>
      </Button>
    </div>
  );
}
