-- Create enum type for MVP status
CREATE TYPE mvp_status AS ENUM (
  'draft',
  'presenting',
  'finalized'
);

-- Create mvps table
CREATE TABLE IF NOT EXISTS public.mvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  canvas_data jsonb,
  generated_prompt text,
  status mvp_status DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_version CHECK (version > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mvps_client_id ON public.mvps(client_id);
CREATE INDEX IF NOT EXISTS idx_mvps_status ON public.mvps(status);
CREATE INDEX IF NOT EXISTS idx_mvps_created_at ON public.mvps(created_at);
CREATE INDEX IF NOT EXISTS idx_mvps_client_id_version ON public.mvps(client_id, version);

-- Enable Row Level Security
ALTER TABLE public.mvps ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.mvps TO authenticated;
GRANT DELETE ON public.mvps TO authenticated;
