'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants';
import { Decisions } from '@/services';
import type { ListDecisionsParams } from '@/types';

export function useDecisions(params: ListDecisionsParams = {}) {
  return useQuery({
    queryKey: queryKeys.decisions.list({
      status: params.status,
      category: params.category,
      sort: params.sort,
      limit: params.limit,
      cursor: params.cursor,
    }),
    queryFn: () => Decisions.list(params),
  });
}
