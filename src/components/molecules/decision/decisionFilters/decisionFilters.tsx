'use client';

import { ArrowDownUp, Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib';
import { getCategoryLabel } from '@/utilities';
import { decisionListSortValues, decisionStatuses } from '@/validations';
import type { DecisionFiltersProps, DecisionListSort } from '@/types';

export function DecisionFilters({
  status,
  category,
  sort,
  categories,
  onChange,
  onReset,
}: DecisionFiltersProps) {
  const tFilters = useTranslations('decisions.list.filters');
  const tStatus = useTranslations('status');
  const tCommon = useTranslations('common');
  const tCategories = useTranslations('categories');
  const hasFilters = status !== 'all' || category !== 'all' || sort !== 'newest';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 p-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-2 font-mono text-xs text-muted-foreground">
          <Filter className="size-3.5" strokeWidth={1.5} />
          {tFilters('label')}
        </div>

        <Select
          value={status}
          onValueChange={(value) => onChange({ status: value })}
        >
          <SelectTrigger size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allStatuses')}</SelectItem>
            {decisionStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {tStatus(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(value) => onChange({ category: value })}
          disabled={categories.length === 0}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tFilters('allCategories')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {getCategoryLabel(c, tCategories)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className={cn('gap-1.5', { invisible: !hasFilters })}
        >
          <X className="size-3.5" strokeWidth={1.5} />
          {tCommon('reset')}
        </Button>
      </div>

      <Select
        value={sort}
        onValueChange={(value) =>
          onChange({ sort: value as DecisionListSort })
        }
      >
        <SelectTrigger size="sm" className="w-44">
          <ArrowDownUp className="size-3.5" strokeWidth={1.5} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {decisionListSortValues.map((key) => (
            <SelectItem key={key} value={key}>
              {tFilters(`sort.${key}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
