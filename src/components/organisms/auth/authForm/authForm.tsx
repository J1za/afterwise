'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Brand, Typography } from '@/components/atoms';
import { PasswordInput } from '@/components/molecules';
import { AuthScene } from '@/components/organisms/auth/authScene';
import type {
  AuthFormProps,
  FieldShellProps,
  Mood,
  SignupValues,
} from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGuestSignIn, useSignIn, useSignUp } from '@/hooks';
import { buildSignupCredentialsSchema } from '@/validations';

export function AuthForm({ mode }: AuthFormProps) {
  const t = useTranslations(`auth.${mode}`);
  const tFields = useTranslations('auth.fields');
  const tSignin = useTranslations('auth.signin');
  const tValidation = useTranslations('auth.validation');

  const schema = useMemo(
    () => buildSignupCredentialsSchema(tValidation, mode),
    [mode, tValidation],
  );

  const form = useForm<SignupValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', passwordConfirm: '' },
  });

  const signIn = useSignIn();
  const signUp = useSignUp();
  const guest = useGuestSignIn();
  const isPending = signIn.isPending || signUp.isPending;
  const isError = signIn.isError || signUp.isError;
  const isSuccess = signIn.isSuccess || signUp.isSuccess;
  const altHref = mode === 'signin' ? '/signup' : '/login';

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [transient, setTransient] = useState<'happy' | 'sad' | null>(null);

  useEffect(() => {
    if (!isSuccess) return;
    setTransient('happy');
  }, [isSuccess]);

  useEffect(() => {
    if (!isError) return;
    setTransient('sad');
    const timer = setTimeout(() => setTransient(null), 1800);
    return () => clearTimeout(timer);
  }, [isError, signIn.failureCount, signUp.failureCount]);

  useEffect(() => {
    const sub = form.watch(() => {
      setTransient((prev) => (prev === 'sad' ? null : prev));
    });
    return () => sub.unsubscribe();
  }, [form]);

  const mood: Mood = useMemo(() => {
    if (transient === 'happy') return 'happy';
    if (transient === 'sad') return 'sad';
    if (passwordFocused) return 'covered';
    return 'neutral';
  }, [transient, passwordFocused]);

  function onSubmit(values: SignupValues) {
    if (mode === 'signin') {
      signIn.mutate({ email: values.email, password: values.password });
    } else {
      signUp.mutate({ email: values.email, password: values.password });
    }
  }

  const submitOnEnter = form.handleSubmit(onSubmit);

  return (
    <div className="grid w-full overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-lg backdrop-blur lg:grid-cols-[1.4fr_1fr]">
      <div className="hidden border-r border-border/60 lg:block">
        <AuthScene mood={mood} />
      </div>

      <div className="flex flex-col gap-6 p-8 sm:p-10">
        <div className="flex flex-col items-center gap-2">
          <Brand className="mb-4" />
          <Typography
            variant="h2"
            className="border-0 pb-0 text-center text-3xl"
          >
            {t('title')}
          </Typography>
          <Typography variant="muted" className="text-center">
            {t('description')}
          </Typography>
        </div>

        <Form {...form}>
          <form
            onSubmit={submitOnEnter}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              const target = event.target as HTMLElement | null;
              if (target?.tagName === 'TEXTAREA') return;
              event.preventDefault();
              if (!isPending) void submitOnEnter(event);
            }}
            className="flex flex-col gap-1.5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FieldShell
                  label={tFields('email')}
                  error={fieldState.error}
                >
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={tFields('emailPlaceholder')}
                      aria-invalid={Boolean(fieldState.error)}
                      {...field}
                    />
                  </FormControl>
                </FieldShell>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FieldShell
                  label={tFields('password')}
                  error={fieldState.error}
                >
                  <FormControl>
                    <PasswordInput
                      autoComplete={
                        mode === 'signin' ? 'current-password' : 'new-password'
                      }
                      placeholder={tFields('passwordPlaceholder')}
                      aria-invalid={Boolean(fieldState.error)}
                      {...field}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        field.onBlur();
                        setPasswordFocused(false);
                      }}
                    />
                  </FormControl>
                </FieldShell>
              )}
            />

            {mode === 'signup' && (
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field, fieldState }) => (
                  <FieldShell
                    label={tFields('passwordConfirm')}
                    error={fieldState.error}
                  >
                    <FormControl>
                      <PasswordInput
                        autoComplete="new-password"
                        placeholder={tFields('passwordConfirmPlaceholder')}
                        aria-invalid={Boolean(fieldState.error)}
                        {...field}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => {
                          field.onBlur();
                          setPasswordFocused(false);
                        }}
                      />
                    </FormControl>
                  </FieldShell>
                )}
              />
            )}

            <Button type="submit" size="lg" disabled={isPending} className="mt-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {t('submit')}
            </Button>
          </form>
        </Form>

        {mode === 'signin' && (
          <>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-xs text-muted-foreground">
                {tSignin('guestOr')}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => guest.mutate()}
                disabled={guest.isPending}
              >
                {guest.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" strokeWidth={1.5} />
                )}
                {tSignin('guestCta')}
              </Button>
              <Typography variant="muted" className="text-center text-xs">
                {tSignin('guestHint')}
              </Typography>
            </div>
          </>
        )}

        <Typography variant="muted" className="text-center text-sm">
          {t('alt')}{' '}
          <Link
            href={altHref}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t('altLink')}
          </Link>
        </Typography>
      </div>
    </div>
  );
}

function FieldShell({ label, error, children }: FieldShellProps) {
  return (
    <FormItem className="flex flex-col gap-0 space-y-0">
      <FormLabel className="mb-1 leading-normal text-foreground">
        {label}
      </FormLabel>
      {children}
      <Typography
        variant="small"
        aria-live="polite"
        className="mt-1 min-h-3.5 text-xs leading-3.5 text-destructive"
      >
        {error?.message ?? ' '}
      </Typography>
    </FormItem>
  );
}
