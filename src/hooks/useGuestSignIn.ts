'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { translateAuthError } from '@/utilities';
import { Auth } from '@/services';

export function useGuestSignIn() {
  const router = useRouter();
  const t = useTranslations('auth.errors');

  return useMutation({
    mutationFn: () => Auth.signInAsGuest(),
    onSuccess: () => {
      router.replace('/decisions/new');
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(t('signupFailed'), {
        description: translateAuthError(error, t),
      });
    },
  });
}
