'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '@/constants';
import { supabase } from '@/lib';
import { Decisions } from '@/services';

export function useDecision(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.decisions.detail(id),
    queryFn: () => Decisions.getOne(id),
    refetchOnMount: 'always',
  });

  useEffect(() => {
    const channel = supabase
      .channel(`decision-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'decisions',
          filter: `id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.decisions.detail(id),
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'decision_analyses',
          filter: `decision_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.decisions.detail(id),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return query;
}
