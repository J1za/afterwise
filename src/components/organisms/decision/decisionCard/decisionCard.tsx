'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatusBadge, Typography } from '@/components/atoms';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib';
import { formatRelative, getCategoryLabel } from '@/utilities';
import type { DecisionCardProps } from '@/types';

export function DecisionCard({ decision }: DecisionCardProps) {
  const t = useTranslations('decisions.list.card');
  const tCategories = useTranslations('categories');
  const { id, status, situation, decision: decisionText, createdAt, analysis } =
    decision;

  return (
    <Link
      href={`/decisions/${id}`}
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-4 backdrop-blur transition-colors',
        'hover:border-foreground/30',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {analysis?.category && (
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel(analysis.category, tCategories)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {formatRelative(createdAt)}
          </span>
          <ArrowUpRight
            className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-70"
            strokeWidth={1.5}
          />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        <Typography variant="muted" className="text-xs uppercase tracking-wide">
          {t('situation')}
        </Typography>
        <p className="line-clamp-2 text-sm leading-snug">{situation}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Typography variant="muted" className="text-xs uppercase tracking-wide">
          {t('decision')}
        </Typography>
        <p className="line-clamp-2 text-sm leading-snug">{decisionText}</p>
      </div>

      {analysis && analysis.cognitiveBiases.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border/40 pt-2">
          {analysis.cognitiveBiases.slice(0, 4).map((bias) => (
            <Badge key={bias.name} variant="outline" className="font-mono text-xs">
              {bias.name}
            </Badge>
          ))}
          {analysis.cognitiveBiases.length > 4 && (
            <Badge variant="outline" className="font-mono text-xs">
              +{analysis.cognitiveBiases.length - 4}
            </Badge>
          )}
        </div>
      )}

    </Link>
  );
}
