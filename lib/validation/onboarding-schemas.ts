import { z } from 'zod';

/**
 * Schémas de validation pour les 5 étapes du formulaire d'onboarding
 */

// Step 1 — Problème
export const Step1Schema = z.object({
  client_id: z
    .string()
    .min(1, 'Veuillez sélectionner un client'),
  company_name: z
    .string()
    .min(1, 'Le nom de l\'entreprise est requis'),
  sector: z
    .string()
    .min(1, 'Le secteur est requis')
    .refine(
      (value) => ['tech', 'finance', 'healthcare', 'education', 'retail', 'logistics', 'media', 'other'].includes(value),
      'Secteur invalide'
    ),
  problem_description: z
    .string()
    .min(1, 'La description du problème est requise')
    .min(50, 'La description doit contenir au moins 50 caractères'),
});

// Step 2 — MVP (pas de validation Zod, c'est un éditeur visuel)

// Step 3 — Stack technique
export const Step3Schema = z.object({
  existing_stack: z
    .array(z.string())
    .min(0),
  tech_constraints: z
    .string()
    .min(0),
  required_integrations: z
    .array(z.string())
    .min(0),
});

// Step 4 — Cadrage (coordonnées + checklists, tout optionnel)
export const Step4Schema = z.object({
  contact_email: z
    .string()
    .email('Email invalide')
    .or(z.literal('')),
  contact_phone: z.string(),
  siret: z.string(),
  address: z.string(),
}).partial();

// Step 5 — Paiement (placeholder, pas de validation)

// Type exports
export type Step1Data = z.infer<typeof Step1Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type Step4Data = z.infer<typeof Step4Schema>;
