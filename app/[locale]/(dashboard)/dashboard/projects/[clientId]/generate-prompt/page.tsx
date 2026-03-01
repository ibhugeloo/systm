export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GeneratePromptContent from './generate-prompt-content';

interface GeneratePromptPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

export default async function GeneratePromptPage({ params }: GeneratePromptPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, company_name, sector, problem_description, onboarding_data')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  // Check if there's an existing prompt saved
  const { data: mvp } = await supabase
    .from('mvps')
    .select('id, generated_prompt')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <GeneratePromptContent
      locale={locale}
      clientId={clientId}
      client={{
        company_name: client.company_name,
        sector: client.sector,
        problem_description: client.problem_description,
      }}
      existingPrompt={mvp?.generated_prompt || null}
      mvpId={mvp?.id || null}
    />
  );
}
