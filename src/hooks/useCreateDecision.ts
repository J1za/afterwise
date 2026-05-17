'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/constants';
import { decisionSchema } from '@/validations';
import type { CreateDecisionInput } from '@/types';

async function postDecision(input: CreateDecisionInput) {
  const response = await fetch('/api/decisions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'failed_to_create');
  }
  return decisionSchema.parse(await response.json());
}

export function useCreateDecision() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('decisions.new');

  return useMutation({
    mutationFn: postDecision,
    onSuccess: (decision) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all() });
      toast.success(t('success'), { description: t('successBody') });
      router.push(`/decisions/${decision.id}` as Route);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(t('errorTitle'), { description: error.message });
    },
  });
}
