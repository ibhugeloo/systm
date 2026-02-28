/**
 * Handoff types for MVP delivery and documentation
 * Defines the structure for handoff documents sent to clients
 */

export interface HandoffContext {
  client_name: string;
  project_name: string;
  generated_date: string;
  team_members: string[];
}

export interface HandoffSolution {
  overview: string;
  key_features: string[];
  user_flows: string[];
  technical_approach: string;
}

export interface HandoffDecision {
  title: string;
  rationale: string;
  alternatives_considered: string[];
}

export interface HandoffSpec {
  component: string;
  description: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  dependencies: string[];
}

export interface HandoffBudget {
  development_cost: number;
  deployment_cost: number;
  maintenance_monthly: number;
  currency: string;
  breakdown: Record<string, number>;
}

export interface HandoffRequest {
  type: 'feature' | 'bug' | 'enhancement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  implementation_notes?: string;
}

export interface HandoffNextStep {
  phase: number;
  title: string;
  description: string;
  timeline_days: number;
  deliverables: string[];
}

export interface HandoffData {
  id: string;
  context: HandoffContext;
  solution: HandoffSolution;
  decisions: HandoffDecision[];
  specifications: HandoffSpec[];
  budget: HandoffBudget;
  feature_requests: HandoffRequest[];
  next_steps: HandoffNextStep[];
  generated_at: string;
  version: number;
}

// Markdown version of handoff
export interface HandoffMarkdown {
  client_id: string;
  mvp_id: string;
  markdown_content: string;
  sent_to: string[]; // array of email addresses
  status: 'draft' | 'sent' | 'acknowledged';
  sent_at?: string;
}
