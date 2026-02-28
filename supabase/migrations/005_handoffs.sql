-- Create enum type for handoff status
CREATE TYPE handoff_status AS ENUM (
  'draft',
  'sent',
  'acknowledged'
);

-- Create handoffs table
CREATE TABLE IF NOT EXISTS public.handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mvp_id uuid NOT NULL REFERENCES public.mvps(id) ON DELETE CASCADE,
  markdown_content text NOT NULL,
  sent_to text[] DEFAULT ARRAY[]::text[],
  sent_at timestamp with time zone,
  status handoff_status DEFAULT 'draft'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_handoffs_client_id ON public.handoffs(client_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_mvp_id ON public.handoffs(mvp_id);
CREATE INDEX IF NOT EXISTS idx_handoffs_status ON public.handoffs(status);

-- Enable Row Level Security
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.handoffs TO authenticated;
GRANT DELETE ON public.handoffs TO authenticated;
