import { ReactNode } from 'react';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FloppyDiskIcon,
  Loading01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface Step {
  number: number;
  title: string;
  icon: IconSvgElement;
  description: string;
  fields?: string[];
}

interface MultiStepFormProps {
  steps: Step[];
  currentStep: number;
  maxStepReached?: number;
  onNext: (e: React.MouseEvent) => void;
  onPrev: () => void;
  onStepClick?: (stepNumber: number) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  children: ReactNode;
}

export function MultiStepForm({
  steps,
  currentStep,
  maxStepReached,
  onNext,
  onPrev,
  onStepClick,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Save',
  submittingLabel = 'Saving...',
  children,
}: MultiStepFormProps) {
  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const effectiveMaxStep = maxStepReached ?? currentStep;

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div
        className="w-full grid"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
        }}
      >
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isReachable = step.number <= effectiveMaxStep;
          const isClickable = isReachable;
          const canClick = onStepClick && isClickable && !isSubmitting;

          return (
            <div key={step.number} className="flex flex-col items-center">
              <div className="flex items-center w-full justify-center mb-3 relative">
                {index > 0 && (
                  <div
                    className={`absolute left-0 top-1/2 h-[2px] -translate-y-1/2 z-0 ${
                      currentStep > index ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: 'calc(50% - 24px)' }}
                  />
                )}

                <div
                  onClick={canClick ? () => onStepClick(step.number) : undefined}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all z-20 relative ${
                    isActive
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : isCompleted
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30 bg-muted'
                  } ${
                    canClick
                      ? 'cursor-pointer hover:scale-110 hover:shadow-md'
                      : isClickable
                        ? 'cursor-default'
                        : 'cursor-not-allowed opacity-60'
                  }`}
                  title={
                    isActive
                      ? `Current step: ${step.title}`
                      : isReachable
                        ? `Click to go to: ${step.title}`
                        : `Step ${step.number}: ${step.title} (not yet reached)`
                  }
                >
                  <HugeiconsIcon
                    icon={step.icon}
                    className={`h-5 w-5 ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground'
                    }`}
                  />
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`absolute right-0 top-1/2 h-[2px] -translate-y-1/2 z-0 ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    style={{ width: 'calc(50% - 24px)' }}
                  />
                )}
              </div>

              <div className="text-center w-full">
                <p
                  onClick={canClick ? () => onStepClick(step.number) : undefined}
                  className={`text-sm font-semibold ${
                    canClick ? 'cursor-pointer hover:text-primary transition-colors' : ''
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={currentStepData.icon} className="h-5 w-5 text-primary" />
            {currentStepData.title}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 bg-background pt-4 pb-2 flex justify-between gap-2 border-t mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 1 || isSubmitting}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastStep ? (
            <Button type="button" onClick={onNext}>
              Next
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type={onSubmit ? 'button' : 'submit'}
              onClick={onSubmit || undefined}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  {submittingLabel}
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
