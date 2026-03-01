export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Client } from '@/types/database';
import ClientsPageContent from './clients-page-content';

interface ClientsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, contact_name, contact_email, sector, status, onboarding_data, created_at')
    .order('created_at', { ascending: false });

  return <ClientsPageContent clients={(clients as Client[]) || []} locale={locale} />;
}
