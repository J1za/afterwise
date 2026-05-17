import type { ComponentProps, ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type ServerAuthStatus = {
  user: AuthUser | null;
  isGuest: boolean;
  decisionCount: number;
  canCreateDecision: boolean;
  firstDecisionId: string | null;
};

export type AuthFormProps = {
  mode: 'signin' | 'signup';
};

export type SignupValues = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export type FieldShellProps = {
  label: string;
  error?: FieldError;
  children: ReactNode;
};

export type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export type LogoutConfirmDialogProps = {
  trigger: ReactNode;
};

export type GuestBannerProps = {
  limitReached: boolean;
};

export type Mood = 'neutral' | 'covered' | 'sad' | 'happy';

export type EyeTarget = {
  x: number;
  y: number;
};

export type AuthSceneProps = {
  mood: Mood;
};

export type AuthCharacterProps = {
  mood: Mood;
  eye: EyeTarget;
};

export type EyeProps = {
  cx: number;
  cy: number;
  size?: number;
  target: EyeTarget;
  mood: Mood;
  blinking?: boolean;
  wink?: boolean;
};
