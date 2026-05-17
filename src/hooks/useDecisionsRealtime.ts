'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/constants';
import { supabase } from '@/lib';

type DecisionRow = {
  id: string;
  status: 'processing' | 'done' | 'error';
  error_message: string | null;
};

export function useDecisionsRealtime() {
  const queryClient = useQueryClient();
  const t = useTranslations('notifications');

  useEffect(() => {
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all() });
    };

    const channel = supabase
      .channel(`decisions-stream-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decisions' },
        (payload) => {
          invalidate();

          if (payload.eventType !== 'UPDATE') return;
          const previous = payload.old as Partial<DecisionRow> | null;
          const next = payload.new as DecisionRow | null;
          if (!next || previous?.status !== 'processing') return;

          if (next.status === 'error') {
            const description = next.error_message
              ? t('analysisFailed.bodyWithReason', {
                  message: next.error_message,
                })
              : t('analysisFailed.body');
            toast.error(t('analysisFailed.title'), { description });
            return;
          }

          if (next.status === 'done') {
            toast.success(t('analysisDone.title'), {
              description: t('analysisDone.body'),
            });
          }
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'decision_analyses' },
        () => invalidate(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, t]);
}
