'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldPath } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Typography } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Stepper, StepperItem } from '@/components/ui/stepper';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDecision } from '@/hooks';
import { cn } from '@/lib';
import { buildDecisionInputSchema } from '@/validations';
import type { CreateDecisionInput } from '@/types';

const draftStorageKey = 'afterwise:decisionDraft';

const stepDefs = [
  {
    field: 'situation' as const,
    max: 4000,
    labelKey: 'situationLabel',
    descriptionKey: 'situationDescription',
  },
  {
    field: 'decision' as const,
    max: 2000,
    labelKey: 'decisionLabel',
    descriptionKey: 'decisionDescription',
  },
  {
    field: 'reasoning' as const,
    max: 4000,
    labelKey: 'reasoningLabel',
    descriptionKey: 'reasoningDescription',
  },
];

const emptyDraft: CreateDecisionInput = {
  situation: '',
  decision: '',
  reasoning: '',
};

function loadDraft(): CreateDecisionInput {
  if (typeof window === 'undefined') return emptyDraft;
  try {
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) return emptyDraft;
    const parsed = JSON.parse(raw);
    return {
      situation: typeof parsed.situation === 'string' ? parsed.situation : '',
      decision: typeof parsed.decision === 'string' ? parsed.decision : '',
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    };
  } catch {
    return emptyDraft;
  }
}

function saveDraft(value: CreateDecisionInput) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(value));
  } catch {}
}

function clearDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(draftStorageKey);
  } catch {}
}

export function DecisionForm() {
  const t = useTranslations('decisions.new');
  const tStepper = useTranslations('decisions.new.stepper');
  const tValidation = useTranslations('decisions.new.validation');

  const [activeStep, setActiveStep] = useState(0);

  const schema = useMemo(
    () => buildDecisionInputSchema(tValidation),
    [tValidation],
  );

  const form = useForm<CreateDecisionInput>({
    resolver: zodResolver(schema),
    defaultValues: emptyDraft,
    mode: 'onChange',
  });
  const create = useCreateDecision();

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    form.reset(loadDraft());
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      saveDraft({
        situation: value.situation ?? '',
        decision: value.decision ?? '',
        reasoning: value.reasoning ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const totalSteps = stepDefs.length;
  const isLastStep = activeStep === totalSteps - 1;
  const currentStep = stepDefs[activeStep];

  async function handleNext() {
    const fieldName = currentStep.field as FieldPath<CreateDecisionInput>;
    const isValid = await form.trigger(fieldName);
    if (!isValid) return;
    setActiveStep((step) => Math.min(step + 1, totalSteps - 1));
  }

  function handleBack() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  function onSubmit(values: CreateDecisionInput) {
    if (!isLastStep) return;
    create.mutate(values, {
      onSuccess: () => {
        clearDraft();
        form.reset(emptyDraft);
      },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Typography variant="h1" className="text-4xl">
          {t('title')}
        </Typography>
        <Typography variant="lead" className="max-w-2xl">
          {t('subtitle')}
        </Typography>
      </div>

      <Stepper activeStep={activeStep} totalSteps={totalSteps}>
        {stepDefs.map((step, index) => (
          <StepperItem
            key={step.field}
            index={index}
            label={tStepper(step.labelKey)}
            description={tStepper(step.descriptionKey)}
          />
        ))}
      </Stepper>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FormField
            control={form.control}
            name={currentStep.field}
            render={({ field }) => {
              const value = field.value ?? '';
              return (
                <FormItem className="rounded-lg border border-border/60 bg-card/60 p-6 backdrop-blur">
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <FormLabel className="font-mono text-xs text-muted-foreground">
                        {tStepper('step', {
                          current: activeStep + 1,
                          total: totalSteps,
                        })}
                      </FormLabel>
                      <Typography variant="large" className="text-base">
                        {t(`fields.${currentStep.field}.title`)}
                      </Typography>
                      <Typography variant="muted" className="text-xs">
                        {t(`fields.${currentStep.field}.description`)}
                      </Typography>
                    </div>
                    <span
                      className={cn('font-mono text-xs', {
                        'text-destructive': value.length > currentStep.max,
                        'text-muted-foreground':
                          value.length <= currentStep.max,
                      })}
                    >
                      {value.length}/{currentStep.max}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        `fields.${currentStep.field}.placeholder`,
                      )}
                      className="min-h-48 resize-none"
                      autoFocus
                      {...field}
                      value={value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex items-center justify-between gap-4">
            <Typography variant="muted" className="text-xs">
              {t('hint')}
            </Typography>
            <div className="flex items-center gap-2">
              {activeStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  disabled={create.isPending}
                >
                  <ArrowLeft className="size-4" strokeWidth={1.5} />
                  {tStepper('back')}
                </Button>
              ) : null}
              {isLastStep ? (
                <Button
                  key="submit"
                  type="submit"
                  size="lg"
                  disabled={create.isPending}
                >
                  {create.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" strokeWidth={1.5} />
                  )}
                  {t('submit')}
                </Button>
              ) : (
                <Button
                  key="next"
                  type="button"
                  size="lg"
                  onClick={handleNext}
                  disabled={create.isPending}
                >
                  {tStepper('next')}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
