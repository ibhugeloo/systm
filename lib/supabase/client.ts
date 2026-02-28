import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export function createClient() {
  // Don't cache on the server to avoid sharing state across requests
  if (typeof window === 'undefined') {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  return supabaseClient;
}
