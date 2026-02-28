'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProblemCapture } from './problem-capture';
import { TechConstraints } from './tech-constraints';
import { BudgetTimeline } from './budget-timeline';
import { ReviewSubmit } from './review-submit';
import { cn } from '@/lib/utils';
import { OnboardingFormData } from '@/types/onboarding';
import {
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
} from '@/lib/validation/onboarding-schemas';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { ZodError } from 'zod';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface OnboardingFormProps {
  clientId?: string;
  locale: string;
  dictionary: Dictionary;
  initialData?: Partial<OnboardingFormData>;
}

type FormErrors = Record<string, string[]>;

const STEPS = [
  { number: 1, label: 'Company Details' },
  { number: 2, label: 'Tech Stack' },
  { number: 3, label: 'Budget & Timeline' },
  { number: 4, label: 'Review & Submit' },
];

export function OnboardingForm({
  clientId,
  locale,
  dictionary,
  initialData = {},
}: OnboardingFormProps): React.ReactElement {
  const router = useRouter();
  const dict = dictionary.onboarding;
  const commonDict = dictionary.common;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = useCallback(
    (step: 1 | 2 | 3): boolean => {
      try {
        if (step === 1) {
          Step1Schema.parse({
            company_name: formData.company_name,
            sector: formData.sector,
            problem_description: formData.problem_description,
            main_objective: formData.main_objective,
          });
        } else if (step === 2) {
          Step2Schema.parse({
            existing_stack: formData.existing_stack,
            tech_constraints: formData.tech_constraints,
            required_integrations: formData.required_integrations,
          });
        } else if (step === 3) {
          Step3Schema.parse({
            budget_range: formData.budget_range,
            desired_timeline: formData.desired_timeline,
            priority: formData.priority,
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
    if (currentStep < 4 && validateStep(currentStep as 1 | 2 | 3)) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback((): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  }, [currentStep]);

  const handleEdit = useCallback((step: 1 | 2 | 3): void => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validateStep(3)) return;

    try {
      Step4Schema.parse(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = [err.message];
        });
        setErrors(newErrors);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createSupabaseClient();

      // Prepare client data
      const clientData = {
        company_name: formData.company_name,
        contact_name: '', // Will be updated by user later
        contact_email: '', // Will be updated by user later
        sector: formData.sector,
        problem_description: formData.problem_description,
        tech_stack: formData.existing_stack || [],
        budget_range: formData.budget_range,
        timeline: formData.desired_timeline,
        status: 'onboarding' as const,
        onboarding_data: {
          company_name: formData.company_name,
          sector: formData.sector,
          problem_description: formData.problem_description,
          main_objective: formData.main_objective,
          existing_stack: formData.existing_stack,
          tech_constraints: formData.tech_constraints,
          required_integrations: formData.required_integrations,
          budget_range: formData.budget_range,
          desired_timeline: formData.desired_timeline,
          priority: formData.priority,
        },
      };

      let newClientId = clientId;

      // Create or update client
      if (clientId) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', clientId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select('id')
          .single();

        if (error) throw error;
        if (!data?.id) throw new Error('Failed to create client');

        newClientId = data.id;
      }

      // Call AI generation endpoint
      const response = await fetch('/api/ai/generate-mvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: newClientId,
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MVP');
      }

      // Redirect to MVP page
      router.push(`/${locale}/clients/${newClientId}/mvp`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        submit: [error instanceof Error ? error.message : 'An error occurred'],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, clientId, validateStep, router, locale]);

  const isStepComplete = (step: number): boolean => {
    if (step === 1) {
      return Boolean(
        formData.company_name && formData.sector && formData.problem_description && formData.main_objective
      );
    } else if (step === 2) {
      return Boolean(formData.existing_stack || formData.required_integrations);
    } else if (step === 3) {
      return Boolean(formData.budget_range && formData.desired_timeline && formData.priority);
    }
    return false;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isCurrentOrPrev = step.number <= currentStep;

            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => {
                    if (step.number < currentStep) {
                      setCurrentStep(step.number as 1 | 2 | 3 | 4);
                    }
                  }}
                  disabled={step.number >= currentStep}
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full font-semibold transition-colors',
                    isActive && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                    isCompleted && 'bg-green-500 text-white cursor-pointer',
                    !isCurrentOrPrev && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </button>

                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-2 rounded-full transition-colors',
                      isCompleted ? 'bg-green-500' : isCurrentOrPrev ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs font-medium">
          {STEPS.map((step) => (
            <span key={step.number} className="text-center flex-1">
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-6">
        {currentStep === 1 && (
          <ProblemCapture
            data={formData}
            onChange={handleStepChange}
            dictionary={dictionary}
            errors={errors}
          />
        )}

        {currentStep === 2 && (
          <TechConstraints
            data={formData}
            onChange={handleStepChange}
            dictionary={dictionary}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <BudgetTimeline
            data={formData}
            onChange={handleStepChange}
            dictionary={dictionary}
            errors={errors}
          />
        )}

        {currentStep === 4 && (
          <ReviewSubmit
            formData={formData}
            onSubmit={handleSubmit}
            onEdit={handleEdit}
            isSubmitting={isSubmitting}
            dictionary={dictionary}
          />
        )}
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex gap-4">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1"
            disabled={currentStep === 1}
          >
            {commonDict.button_back}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {commonDict.button_next}
          </Button>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.submit[0]}</p>
        </div>
      )}
    </div>
  );
}
