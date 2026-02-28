-- ========================================
-- systm.re Platform — Full Database Setup
-- Run this in the Supabase SQL Editor
-- ========================================
-- Note: Auth is handled at application level (cookie-based).
-- RLS policies allow full access via anon key.

-- ========================================
-- ENUMS
-- ========================================
DO $$ BEGIN CREATE TYPE client_status AS ENUM ('onboarding','mvp_generated','demo_scheduled','demo_done','handoff_sent','in_production','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE mvp_status AS ENUM ('draft','presenting','finalized'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE handoff_status AS ENUM ('draft','sent','acknowledged'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE request_type AS ENUM ('feature','bug','meeting','question'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE request_priority AS ENUM ('low','medium','high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE request_status AS ENUM ('pending','in_review','done','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========================================
-- 1. PROFILES
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'team_member', 'client')),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ========================================
-- 2. CLIENTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  problem_description text NOT NULL DEFAULT '',
  tech_stack text[] DEFAULT ARRAY[]::text[],
  budget_range text NOT NULL DEFAULT '',
  timeline text NOT NULL DEFAULT '',
  status client_status DEFAULT 'onboarding',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  onboarding_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- ========================================
-- 3. MVPS
-- ========================================
CREATE TABLE IF NOT EXISTS public.mvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  canvas_data jsonb,
  generated_prompt text,
  status mvp_status DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mvps_client_id ON public.mvps(client_id);
CREATE INDEX IF NOT EXISTS idx_mvps_status ON public.mvps(status);

-- ========================================
-- 4. CONVERSATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_summary text,
  demo_session_id text,
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);

-- ========================================
-- 5. HANDOFFS
-- ========================================
CREATE TABLE IF NOT EXISTS public.handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mvp_id uuid NOT NULL REFERENCES public.mvps(id) ON DELETE CASCADE,
  markdown_content text NOT NULL DEFAULT '',
  sent_to text[] DEFAULT ARRAY[]::text[],
  sent_at timestamp with time zone,
  status handoff_status DEFAULT 'draft'
);
CREATE INDEX IF NOT EXISTS idx_handoffs_client_id ON public.handoffs(client_id);

-- ========================================
-- 6. CLIENT REQUESTS
-- ========================================
CREATE TABLE IF NOT EXISTS public.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority request_priority DEFAULT 'medium',
  status request_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON public.client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON public.client_requests(status);

-- ========================================
-- 7. RLS — Open access (auth handled at app level)
-- ========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

-- Grant to both anon and authenticated
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','clients','mvps','conversations','handoffs','client_requests']) LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Open policies
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.mvps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.handoffs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow full access" ON public.client_requests FOR ALL USING (true) WITH CHECK (true);
