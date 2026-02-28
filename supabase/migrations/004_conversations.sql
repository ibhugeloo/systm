-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_summary text,
  demo_session_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_messages CHECK (jsonb_typeof(messages) = 'array')
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT DELETE ON public.conversations TO authenticated;
