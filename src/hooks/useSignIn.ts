'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { translateAuthError } from '@/utilities';
import { Auth } from '@/services';
import type { AuthCredentials } from '@/types';

export function useSignIn() {
  const router = useRouter();
  const t = useTranslations('auth.errors');

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => Auth.signIn(credentials),
    onSuccess: () => {
      router.replace('/decisions/new');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(t('signinFailed'), {
        description: translateAuthError(error, t),
      });
    },
  });
}
