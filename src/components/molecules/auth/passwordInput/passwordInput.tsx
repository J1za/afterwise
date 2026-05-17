'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib';
import type { PasswordInputProps } from '@/types';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const t = useTranslations('auth.fields');
    const Icon = visible ? EyeOff : Eye;

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          className={cn('pr-10', className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          aria-pressed={visible}
          tabIndex={-1}
          className="absolute inset-y-0 right-1 my-auto text-muted-foreground hover:text-foreground"
        >
          <Icon strokeWidth={1.75} />
        </Button>
      </div>
    );
  },
);
