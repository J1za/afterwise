import type { ElementType } from 'react';
import { cn } from '@/lib';
import type { TypographyProps, TypographyVariant } from '@/types';

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7 [&:not(:first-child)]:mt-6',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm leading-none font-medium',
  muted: 'text-sm text-muted-foreground',
  blockquote: 'mt-6 border-l-2 pl-6 italic',
};

const defaultElement: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  lead: 'p',
  large: 'p',
  small: 'small',
  muted: 'p',
  blockquote: 'blockquote',
};

export function Typography<E extends ElementType = 'p'>({
  variant = 'p',
  as,
  className,
  ...props
}: TypographyProps<E>) {
  const Component = (as ?? defaultElement[variant]) as ElementType;
  return (
    <Component className={cn(variantStyles[variant], className)} {...props} />
  );
}
