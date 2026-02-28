/**
 * Onboarding form types for multi-step form flow
 * Defines the data structure for the client onboarding process
 */

export interface OnboardingStep1Data {
  company_name: string;
  sector: string;
  problem_description: string;
  main_objective: string;
}

export interface OnboardingStep2Data {
  existing_stack: string[];
  tech_constraints: string;
  required_integrations: string[];
}

export interface OnboardingStep3Data {
  budget_range: string;
  desired_timeline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface OnboardingFormData extends OnboardingStep1Data, OnboardingStep2Data, OnboardingStep3Data {
  completed_at?: string;
  submitted_at?: string;
}

// Individual step types for form state management
export type OnboardingStepData = OnboardingStep1Data | OnboardingStep2Data | OnboardingStep3Data;

// Form progress tracking
export interface OnboardingProgress {
  current_step: 1 | 2 | 3;
  completed_steps: number[];
  data: Partial<OnboardingFormData>;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}
