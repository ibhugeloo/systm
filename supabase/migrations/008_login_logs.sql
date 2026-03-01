-- Create login_logs table
CREATE TABLE IF NOT EXISTS public.login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address text NOT NULL DEFAULT 'unknown',
  user_agent text NOT NULL DEFAULT 'unknown',
  logged_in_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_logged_in_at ON public.login_logs(logged_in_at);

-- Enable RLS with open policy (auth handled at app level)
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.login_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.login_logs TO authenticated;

CREATE POLICY "Allow full access" ON public.login_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Add password_hash and settings to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settings jsonb;
