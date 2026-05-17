import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type BrandProps = {
  className?: string;
  labelClassName?: string;
};

export type GradientBackdropProps = {
  className?: string;
};

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'lead'
  | 'large'
  | 'small'
  | 'muted'
  | 'blockquote';

export type TypographyProps<E extends ElementType> = {
  as?: E;
  variant?: TypographyVariant;
} & Omit<ComponentPropsWithoutRef<E>, 'as' | 'variant'>;

export type AppSidebarProps = {
  isGuest: boolean;
};

export type ProtectedLayoutProps = {
  children: ReactNode;
  isGuest: boolean;
  canCreateDecision: boolean;
};
