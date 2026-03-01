export const dynamic = 'force-dynamic';

import { getAuthSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsContent from './settings-content';

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale } = await params;
  const session = await getAuthSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const supabase = await createClient();

  // Fetch clients for notification settings
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name');

  return (
    <SettingsContent
      profile={session.user}
      clients={(clients || []) as Array<{ id: string; company_name: string }>}
    />
  );
}
