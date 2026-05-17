'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSignOut } from '@/hooks';
import type { LogoutConfirmDialogProps } from '@/types';

export function LogoutConfirmDialog({ trigger }: LogoutConfirmDialogProps) {
  const t = useTranslations('nav.logoutConfirm');
  const signOut = useSignOut();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={signOut.isPending}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            {t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
