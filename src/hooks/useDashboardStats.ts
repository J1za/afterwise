'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants';
import { Dashboard } from '@/services';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => Dashboard.getStats(),
    staleTime: 30_000,
  });
}
