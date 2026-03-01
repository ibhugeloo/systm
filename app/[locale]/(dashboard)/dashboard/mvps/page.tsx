export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import MvpsPageContent from './mvps-page-content';

export default async function MvpsPage() {
  const supabase = await createClient();

  const { data: mvps } = await supabase
    .from('mvps')
    .select('id, client_id, generated_prompt, figma_url, status, created_at, clients(company_name)')
    .order('created_at', { ascending: false });

  // Also fetch clients for the create dialog
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name');

  // Normalize the join result: Supabase returns clients as array for joins
  const normalizedMvps = (mvps || []).map((mvp) => ({
    id: mvp.id as string,
    client_id: mvp.client_id as string,
    generated_prompt: mvp.generated_prompt as string | null,
    figma_url: (mvp as Record<string, unknown>).figma_url as string | null,
    status: mvp.status as string,
    created_at: mvp.created_at as string,
    clients: Array.isArray(mvp.clients)
      ? (mvp.clients[0] as { company_name: string } | undefined) || null
      : (mvp.clients as { company_name: string } | null),
  }));

  return (
    <MvpsPageContent
      mvps={normalizedMvps}
      clients={(clients || []) as Array<{ id: string; company_name: string }>}
    />
  );
}
