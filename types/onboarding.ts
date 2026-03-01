/**
 * Onboarding form types for multi-step form flow
 * 4 étapes : Problème → Stack → Cadrage → Paiement
 */

// --- Estimation IA ---

export interface AiEstimation {
  duration: string;
  budget: string;
  complexity: 'low' | 'medium' | 'high';
  breakdown: Array<{
    phase: string;
    duration: string;
    cost: string;
  }>;
}

// --- Step Data ---

export interface OnboardingStep1Data {
  client_id: string;
  company_name: string;
  sector: string;
  problem_description: string;
}

export interface OnboardingStep3Data {
  existing_stack: string[];
  tech_constraints: string;
  required_integrations: string[];
}

export interface OnboardingStep4Data {
  // Coordonnées client
  contact_email: string;
  contact_phone: string;
  siret: string;
  address: string;
  // Contenu client
  logo_received: boolean;
  brand_guidelines_received: boolean;
  page_texts_received: boolean;
  visuals_received: boolean;
  social_links_received: boolean;
  legal_info_received: boolean;
  cgv_cgu_received: boolean;
  translated_content_received: boolean;
  cms_content_received: boolean;
  // Accès
  dns_access: boolean;
  google_search_console: boolean;
  google_analytics: boolean;
  stripe_keys: boolean;
  resend_keys: boolean;
  supabase_keys: boolean;
  sanity_access: boolean;
  // Conformité
  legal_mentions: boolean;
  privacy_policy: boolean;
  cookie_banner: boolean;
  cgv_ready: boolean;
  cgu_ready: boolean;
  // Pré-production
  functional_tests: boolean;
  responsive_verified: boolean;
  seo_configured: boolean;
  search_console_connected: boolean;
  analytics_operational: boolean;
  stripe_production: boolean;
  emails_tested: boolean;
  custom_domain: boolean;
  ssl_active: boolean;
  lighthouse_ok: boolean;
  // Livraison
  client_validated: boolean;
  final_invoice_paid: boolean;
  documentation_delivered: boolean;
  training_done: boolean;
  access_transferred: boolean;
  maintenance_proposed: boolean;
}

export interface OnboardingStep5Data {
  payment_status: 'pending' | 'partial' | 'paid';
}

// --- Combined Form Data ---

export interface OnboardingFormData extends OnboardingStep1Data, OnboardingStep3Data {
  estimation?: AiEstimation;
  // Step 3 data (cadrage)
  contact_email?: string;
  contact_phone?: string;
  siret?: string;
  address?: string;
  // Step 3 checklists (all optional)
  logo_received?: boolean;
  brand_guidelines_received?: boolean;
  page_texts_received?: boolean;
  visuals_received?: boolean;
  social_links_received?: boolean;
  legal_info_received?: boolean;
  cgv_cgu_received?: boolean;
  translated_content_received?: boolean;
  cms_content_received?: boolean;
  dns_access?: boolean;
  google_search_console?: boolean;
  google_analytics?: boolean;
  stripe_keys?: boolean;
  resend_keys?: boolean;
  supabase_keys?: boolean;
  sanity_access?: boolean;
  legal_mentions?: boolean;
  privacy_policy?: boolean;
  cookie_banner?: boolean;
  cgv_ready?: boolean;
  cgu_ready?: boolean;
  functional_tests?: boolean;
  responsive_verified?: boolean;
  seo_configured?: boolean;
  search_console_connected?: boolean;
  analytics_operational?: boolean;
  stripe_production?: boolean;
  emails_tested?: boolean;
  custom_domain?: boolean;
  ssl_active?: boolean;
  lighthouse_ok?: boolean;
  client_validated?: boolean;
  final_invoice_paid?: boolean;
  documentation_delivered?: boolean;
  training_done?: boolean;
  access_transferred?: boolean;
  maintenance_proposed?: boolean;
  // Step 4
  payment_status?: 'pending' | 'partial' | 'paid';
  // Meta
  completed_at?: string;
  submitted_at?: string;
}

// Individual step types for form state management
export type OnboardingStepData =
  | OnboardingStep1Data
  | OnboardingStep3Data
  | OnboardingStep4Data
  | OnboardingStep5Data;

// Form progress tracking
export interface OnboardingProgress {
  current_step: 1 | 2 | 3 | 4;
  completed_steps: number[];
  data: Partial<OnboardingFormData>;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}
