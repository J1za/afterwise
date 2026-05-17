'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DecisionStatus, StatusBadgeProps } from '@/types';

const statusConfig: Record<
  DecisionStatus,
  { className: string; Icon: typeof Loader2; spin?: boolean }
> = {
  processing: {
    className:
      'bg-status-processing/15 text-status-processing border-status-processing/30',
    Icon: Loader2,
    spin: true,
  },
  done: {
    className: 'bg-status-done/15 text-status-done border-status-done/30',
    Icon: CheckCircle2,
  },
  error: {
    className: 'bg-status-error/15 text-status-error border-status-error/30',
    Icon: XCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations('status');
  const { className: variantClass, Icon, spin } = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', variantClass, className)}
    >
      <Icon className={cn('size-3', { 'animate-spin': spin })} />
      {t(status)}
    </Badge>
  );
}
