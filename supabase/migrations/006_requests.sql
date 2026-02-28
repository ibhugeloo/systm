-- Create enum types for client requests
CREATE TYPE request_type AS ENUM (
  'feature',
  'bug',
  'meeting',
  'question'
);

CREATE TYPE request_priority AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'in_review',
  'done',
  'rejected'
);

-- Create client_requests table
CREATE TABLE IF NOT EXISTS public.client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type request_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority request_priority DEFAULT 'medium',
  status request_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON public.client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON public.client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_priority ON public.client_requests(priority);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON public.client_requests(created_at);

-- Enable Row Level Security
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.client_requests TO authenticated;
GRANT DELETE ON public.client_requests TO authenticated;
