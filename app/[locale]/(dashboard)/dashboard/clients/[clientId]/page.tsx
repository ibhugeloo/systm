export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ClientDetailContent from './client-detail-content';

interface PageProps {
  params: Promise<{ locale: string; clientId: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  // Fetch client
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  // Fetch conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('client_id', clientId)
    .single();

  // Fetch login logs for this client (match by contact_email → profiles)
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', client.contact_email)
    .single();

  let loginLogs: Array<{ id: string; logged_in_at: string; ip_address: string; user_agent: string }> = [];
  if (profileData) {
    const { data: logs } = await supabase
      .from('login_logs')
      .select('id, logged_in_at, ip_address, user_agent')
      .eq('user_id', profileData.id)
      .order('logged_in_at', { ascending: false })
      .limit(20);
    loginLogs = (logs || []) as typeof loginLogs;
  }

  // Fetch requests
  const { data: requests } = await supabase
    .from('client_requests')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return (
    <ClientDetailContent
      locale={locale}
      client={client}
      conversationId={conversation?.id || null}
      loginLogs={loginLogs}
      requests={requests || []}
    />
  );
}
