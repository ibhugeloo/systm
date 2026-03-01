'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { TechConstraints } from './tech-constraints';
import { ProjectScoping } from './project-scoping';
import { PaymentStep } from './payment-step';
import { cn } from '@/lib/utils';
import { OnboardingFormData } from '@/types/onboarding';
import { Step3Schema } from '@/lib/validation/onboarding-schemas';
import { ZodError } from 'zod';
import { Cpu, ClipboardCheck, CreditCard, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DRAFT_KEY = 'onboarding-draft';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface OnboardingFormProps {
  locale: string;
  dictionary: Dictionary;
  clients: Array<{ id: string; company_name: string; sector?: string }>;
  initialData?: Partial<OnboardingFormData>;
}

type StepNumber = 1 | 2 | 3;
type FormErrors = Record<string, string[]>;

const STEP_ICONS = [Cpu, ClipboardCheck, CreditCard];

export function OnboardingForm({
  dictionary,
  initialData = {},
}: OnboardingFormProps): React.ReactElement {
  const dict = dictionary.onboarding;
  const commonDict = dictionary.common;

  const steps = [
    { number: 1, label: dict.stepper_label_3, desc: dict.step_3_desc },
    { number: 2, label: dict.stepper_label_4, desc: dict.step_4_desc },
    { number: 3, label: dict.stepper_label_5, desc: dict.step_5_desc },
  ];

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { formData: savedData, currentStep: savedStep } = JSON.parse(saved);
        if (savedData && Object.keys(savedData).length > 0) {
          setFormData(savedData);
          if (savedStep) setCurrentStep(savedStep as StepNumber);
          toast.success('Brouillon restauré');
        }
      }
    } catch {
      // ignore corrupted localStorage
    }
    isInitializedRef.current = true;
  }, []);

  // Save draft on changes (debounced 500ms)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData, currentStep }));
      } catch {
        // ignore full localStorage
      }
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, currentStep]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData({});
    setCurrentStep(1);
    setErrors({});
    toast.success('Brouillon effacé');
  }, []);

  const validateStep = useCallback(
    (step: StepNumber): boolean => {
      try {
        if (step === 1) {
          Step3Schema.parse({
            existing_stack: formData.existing_stack,
            tech_constraints: formData.tech_constraints,
            required_integrations: formData.required_integrations,
          });
        }
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const newErrors: FormErrors = {};
          error.errors.forEach((err) => {
            const path = err.path[0] as string;
            newErrors[path] = [err.message];
          });
          setErrors(newErrors);
        }
        return false;
      }
    },
    [formData]
  );

  const handleStepChange = useCallback(
    (data: Partial<OnboardingFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const handleNext = useCallback((): void => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as StepNumber);
    }
  }, [currentStep]);

  const handleBack = useCallback((): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  }, [currentStep]);

  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  const stepDictKeys: Record<number, string> = {
    1: 'step_3',
    2: 'step_4',
    3: 'step_5',
  };
  const stepDescKeys: Record<number, string> = {
    1: 'step_3_desc',
    2: 'step_4_desc',
    3: 'step_5_desc',
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-6 left-[calc(15%)] right-[calc(15%)] h-0.5 bg-border" />
        <div
          className="absolute top-6 left-[calc(15%)] h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent * 0.7}%` }}
        />

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isClickable = step.number < currentStep;

            return (
              <button
                key={step.number}
                onClick={() => {
                  if (isClickable) {
                    setCurrentStep(step.number as StepNumber);
                  }
                }}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 group w-1/3',
                  isClickable && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isActive && 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110',
                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                    !isActive && !isCompleted && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <p
                  className={cn(
                    'text-xs font-semibold transition-colors text-center',
                    isActive && 'text-foreground',
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold tracking-tight">
          {dict[stepDictKeys[currentStep]]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {dict[stepDescKeys[currentStep]]}
        </p>
      </div>

      {/* Form Content */}
      <div className="animate-fadeIn">
        {currentStep === 1 && (
          <TechConstraints
            data={formData}
            onChange={handleStepChange}
            dictionary={dictionary}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <ProjectScoping
            data={formData}
            onChange={handleStepChange}
            dictionary={dictionary}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep dictionary={dictionary} />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-2">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 gap-2 text-base"
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          {commonDict.button_back}
        </Button>
        {currentStep < 3 && (
          <Button
            onClick={handleNext}
            className="flex-1 h-12 gap-2 text-base"
          >
            {commonDict.button_next}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Clear draft */}
      <div className="flex justify-center">
        <Button
          onClick={clearDraft}
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Effacer le brouillon
        </Button>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errors.submit[0]}</p>
        </div>
      )}
    </div>
  );
}
