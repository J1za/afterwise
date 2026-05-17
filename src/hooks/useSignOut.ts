'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { translateAuthError } from '@/utilities';
import { Auth } from '@/services';

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('auth.errors');

  return useMutation({
    mutationFn: () => Auth.signOut(),
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(t('signoutFailed'), {
        description: translateAuthError(error, t),
      });
    },
  });
}
