-- ========================================
-- Row Level Security Policies
-- Open access — auth is handled at the application level (cookie-based)
-- ========================================

-- Drop all existing policies to avoid conflicts
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

-- Grant full CRUD to both anon and authenticated roles
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','clients','mvps','conversations','handoffs','client_requests']) LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Open policies — allow all operations
CREATE POLICY "Allow full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON public.mvps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON public.handoffs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON public.client_requests FOR ALL USING (true) WITH CHECK (true);
