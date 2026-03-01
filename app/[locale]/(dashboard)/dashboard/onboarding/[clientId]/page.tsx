export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import OnboardingDetailContent from './onboarding-detail-content';

interface OnboardingDetailPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

export default async function OnboardingDetailPage({ params }: OnboardingDetailPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, company_name, sector, status, tech_stack, onboarding_data')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <OnboardingDetailContent
      locale={locale}
      client={{
        id: client.id,
        company_name: client.company_name,
        sector: client.sector,
        status: client.status,
        tech_stack: (client.tech_stack || []) as string[],
        onboarding_data: (client.onboarding_data || {}) as Record<string, unknown>,
      }}
    />
  );
}
