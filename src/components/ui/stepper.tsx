'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib';

type StepperContextValue = {
  activeStep: number;
  totalSteps: number;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext() {
  const ctx = React.useContext(StepperContext);
  if (!ctx) {
    throw new Error('Stepper subcomponents must be used inside <Stepper>');
  }
  return ctx;
}

type StepperProps = React.ComponentProps<'div'> & {
  activeStep: number;
  totalSteps: number;
};

function Stepper({
  className,
  activeStep,
  totalSteps,
  children,
  ...props
}: StepperProps) {
  const value = React.useMemo(
    () => ({ activeStep, totalSteps }),
    [activeStep, totalSteps],
  );

  return (
    <StepperContext.Provider value={value}>
      <div
        data-slot="stepper"
        className={cn('flex w-full items-center gap-2', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

type StepProps = React.ComponentProps<'div'> & {
  index: number;
  label?: string;
  description?: string;
};

function StepperItem({
  className,
  index,
  label,
  description,
  ...props
}: StepProps) {
  const { activeStep, totalSteps } = useStepperContext();
  const isCompleted = index < activeStep;
  const isActive = index === activeStep;
  const isLast = index === totalSteps - 1;

  return (
    <div
      data-slot="stepper-item"
      data-state={isCompleted ? 'completed' : isActive ? 'active' : 'inactive'}
      className={cn(
        'flex items-center gap-3',
        { 'flex-1': !isLast, 'shrink-0': isLast },
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors',
            {
              'border-primary bg-primary text-primary-foreground': isCompleted,
              'border-primary bg-background text-primary': isActive,
              'border-border bg-background text-muted-foreground':
                !isCompleted && !isActive,
            },
          )}
        >
          {isCompleted ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
        {label ? (
          <div className="flex flex-col items-center text-center">
            <span
              className={cn('text-sm font-medium transition-colors', {
                'text-foreground': isCompleted || isActive,
                'text-muted-foreground': !isCompleted && !isActive,
              })}
            >
              {label}
            </span>
            {description ? (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {!isLast ? (
        <div
          className={cn('mb-10 h-px flex-1 transition-colors', {
            'bg-primary': isCompleted,
            'bg-border': !isCompleted,
          })}
        />
      ) : null}
    </div>
  );
}

export { Stepper, StepperItem };
