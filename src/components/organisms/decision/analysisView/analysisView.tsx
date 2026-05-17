'use client';

import { Brain, Lightbulb, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { getCategoryLabel } from '@/utilities';
import type { AnalysisViewProps } from '@/types';

export function AnalysisView({ analysis }: AnalysisViewProps) {
  const t = useTranslations('analysis');
  const tCategories = useTranslations('categories');
  const { category, summary, cognitiveBiases, missedAlternatives, modelId } =
    analysis;

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border/60 bg-card/60 p-8 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" strokeWidth={1.5} />
          <Typography
            variant="muted"
            className="font-mono text-xs uppercase tracking-wide"
          >
            {t('label')}
          </Typography>
          <Badge variant="secondary" className="text-xs">
            {getCategoryLabel(category, tCategories)}
          </Badge>
        </div>
        <Typography variant="muted" className="font-mono text-xs">
          {modelId}
        </Typography>
      </div>

      <Typography variant="p" className="text-lg leading-relaxed first:mt-0">
        {summary}
      </Typography>

      {cognitiveBiases.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Brain className="size-4 text-chart-1" strokeWidth={1.5} />
            <Typography variant="large" className="text-base">
              {t('biases')}
            </Typography>
            <Typography variant="muted" className="font-mono text-xs">
              ({cognitiveBiases.length})
            </Typography>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cognitiveBiases.map((bias) => (
              <article
                key={bias.name}
                className="flex flex-col gap-2 rounded-md border border-border/50 bg-background/40 p-4"
              >
                <Typography
                  variant="small"
                  className="font-mono text-foreground"
                >
                  {bias.name}
                </Typography>
                <Typography variant="muted" className="text-sm leading-relaxed">
                  {bias.description}
                </Typography>
              </article>
            ))}
          </div>
        </section>
      )}

      {missedAlternatives.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-chart-4" strokeWidth={1.5} />
            <Typography variant="large" className="text-base">
              {t('alternatives')}
            </Typography>
            <Typography variant="muted" className="font-mono text-xs">
              ({missedAlternatives.length})
            </Typography>
          </div>
          <div className="flex flex-col gap-3">
            {missedAlternatives.map((alt) => (
              <article
                key={alt.title}
                className="flex flex-col gap-2 rounded-md border border-border/50 bg-background/40 p-4"
              >
                <Typography variant="small" className="text-foreground">
                  {alt.title}
                </Typography>
                <Typography variant="muted" className="text-sm leading-relaxed">
                  {alt.description}
                </Typography>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
