'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { translateAuthError } from '@/utilities';
import { Auth } from '@/services';
import type { AuthCredentials } from '@/types';

export function useSignUp() {
  const router = useRouter();
  const tErrors = useTranslations('auth.errors');
  const tSuccess = useTranslations('auth.success');

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => Auth.signUp(credentials),
    onSuccess: (user) => {
      if (user) {
        toast.success(tSuccess('signup'), {
          description: tSuccess('signupBody'),
        });
        router.replace('/decisions/new');
        router.refresh();
      } else {
        toast.success(tSuccess('confirmEmail'), {
          description: tSuccess('confirmEmailBody'),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(tErrors('signupFailed'), {
        description: translateAuthError(error, tErrors),
      });
    },
  });
}
