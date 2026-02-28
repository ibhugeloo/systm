import { z } from 'zod';

/**
 * Validation schemas for onboarding form steps
 * Strict TypeScript with proper type inference
 */

export const Step1Schema = z.object({
  company_name: z
    .string()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be at least 2 characters'),
  sector: z
    .string()
    .min(1, 'Sector is required')
    .refine(
      (value) => ['tech', 'finance', 'healthcare', 'education', 'retail', 'logistics', 'media', 'other'].includes(value),
      'Invalid sector selected'
    ),
  problem_description: z
    .string()
    .min(1, 'Problem description is required')
    .min(50, 'Problem description must be at least 50 characters'),
  main_objective: z
    .string()
    .min(1, 'Main objective is required')
    .min(5, 'Main objective must be at least 5 characters'),
});

export const Step2Schema = z.object({
  existing_stack: z
    .array(z.string())
    .min(0, 'Select at least one technology'),
  tech_constraints: z
    .string()
    .min(0, 'Optional field'),
  required_integrations: z
    .array(z.string())
    .min(0, 'Select at least one integration'),
});

export const Step3Schema = z.object({
  budget_range: z
    .string()
    .min(1, 'Budget range is required')
    .refine(
      (value) => ['<5k', '5k-15k', '15k-50k', '50k-100k', '>100k'].includes(value),
      'Invalid budget range selected'
    ),
  desired_timeline: z
    .string()
    .min(1, 'Timeline is required')
    .refine(
      (value) => ['<1month', '1-3months', '3-6months', '>6months'].includes(value),
      'Invalid timeline selected'
    ),
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .refine(
      (value) => ['low', 'medium', 'high', 'critical'].includes(value),
      'Invalid priority selected'
    ),
});

export const Step4Schema = z.object({
  company_name: z.string().min(1),
  sector: z.string().min(1),
  problem_description: z.string().min(50),
  main_objective: z.string().min(1),
  existing_stack: z.array(z.string()),
  tech_constraints: z.string(),
  required_integrations: z.array(z.string()),
  budget_range: z.string().min(1),
  desired_timeline: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

// Type exports
export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type Step4Data = z.infer<typeof Step4Schema>;
