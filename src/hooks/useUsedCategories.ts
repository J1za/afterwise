'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants';
import { Decisions } from '@/services';

export function useUsedCategories() {
  return useQuery({
    queryKey: queryKeys.decisions.usedCategories(),
    queryFn: () => Decisions.usedCategories(),
  });
}
