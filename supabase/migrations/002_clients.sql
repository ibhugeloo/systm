-- Create enum type for client status
CREATE TYPE client_status AS ENUM (
  'onboarding',
  'mvp_generated',
  'demo_scheduled',
  'demo_done',
  'handoff_sent',
  'in_production',
  'closed'
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  sector text NOT NULL,
  problem_description text NOT NULL,
  tech_stack text[] DEFAULT ARRAY[]::text[],
  budget_range text NOT NULL,
  timeline text NOT NULL,
  status client_status DEFAULT 'onboarding',
  assigned_to uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  onboarding_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_contact_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_company_name ON public.clients(company_name);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.clients TO authenticated;
GRANT DELETE ON public.clients TO authenticated;
