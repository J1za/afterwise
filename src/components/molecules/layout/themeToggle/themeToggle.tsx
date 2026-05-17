'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('nav.theme');
  const isDark = resolvedTheme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={t('label')}
      aria-pressed={isDark}
      className="relative size-9 overflow-hidden"
    >
      <Sun
        className={cn(
          'absolute size-4 transition-all duration-500 ease-out',
          {
            'scale-100 rotate-0 opacity-100': !isDark,
            'scale-0 -rotate-90 opacity-0': isDark,
          },
        )}
        strokeWidth={1.75}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all duration-500 ease-out',
          {
            'scale-100 rotate-0 opacity-100': isDark,
            'scale-0 rotate-90 opacity-0': !isDark,
          },
        )}
        strokeWidth={1.75}
      />
    </Button>
  );
}
