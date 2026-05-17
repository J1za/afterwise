import { cn } from '@/lib';
import type { BrandProps } from '@/types';

export function Brand({ className, labelClassName }: BrandProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-sm tracking-tight',
        className,
      )}
    >
      <span className="inline-block size-2 shrink-0 rounded-full bg-primary" />
      <span className={cn('font-semibold text-foreground', labelClassName)}>
        afterwise
      </span>
    </span>
  );
}
