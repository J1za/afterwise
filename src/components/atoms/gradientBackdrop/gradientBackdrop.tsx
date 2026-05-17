import { cn } from '@/lib';
import type { GradientBackdropProps } from '@/types';

export function GradientBackdrop({ className }: GradientBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className,
      )}
    >
      <div className="absolute -top-32 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
      <div className="absolute top-1/3 right-[-160px] size-[440px] rounded-full bg-chart-2/10 blur-3xl dark:bg-chart-2/15" />
      <div className="absolute bottom-[-200px] left-[-120px] size-[520px] rounded-full bg-chart-5/10 blur-3xl dark:bg-chart-5/15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,transparent_60%,var(--background)_100%)]" />
    </div>
  );
}
