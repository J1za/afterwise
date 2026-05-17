'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { GuestBannerProps } from '@/types';

export function GuestBanner({ limitReached }: GuestBannerProps) {
  const t = useTranslations('guest');
  return (
    <Alert className="flex flex-col gap-3 border-violet-500/30 bg-violet-500/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Sparkles className="size-4 text-violet-500" strokeWidth={1.75} />
        <div className="flex flex-col gap-1">
          <AlertTitle>{limitReached ? t('limitReached') : t('banner')}</AlertTitle>
          <AlertDescription>{t('banner')}</AlertDescription>
        </div>
      </div>
      <Button asChild size="sm" className="self-start sm:self-auto">
        <Link href="/signup">{t('signupCta')}</Link>
      </Button>
    </Alert>
  );
}
