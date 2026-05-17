'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/constants';

async function retryAnalysis(id: string) {
  const response = await fetch(`/api/decisions/${id}/retry`, {
    method: 'POST',
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'retry_failed');
  }
}

export function useRetryAnalysis(id: string) {
  const queryClient = useQueryClient();
  const tDetail = useTranslations('decisions.detail');
  const tCommon = useTranslations('common');

  return useMutation({
    mutationFn: () => retryAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.decisions.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all() });
      toast.success(tDetail('retrySuccess'), {
        description: tDetail('retrySuccessBody'),
      });
    },
    onError: (error: Error) => {
      toast.error(tCommon('error'), { description: error.message });
    },
  });
}
