export const dynamic = 'force-dynamic';

import React from 'react';
import { getDictionary } from '@/lib/get-dictionaries';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { Locale } from '@/lib/i18n-config';
import { ChevronRight } from 'lucide-react';


interface OnboardingPageProps {
  params: Promise<{
    locale: Locale;
    clientId: string;
  }>;
}

export default async function OnboardingPage({
  params,
}: OnboardingPageProps): Promise<React.ReactElement> {
  const { locale, clientId } = await params;
  const dictionary = await getDictionary(locale);
  const supabase = await createSupabaseServer();

  // Fetch existing client data if available
  let initialData = undefined;
  let clientExists = false;

  if (clientId && clientId !== 'new') {
    const { data: client, error } = await supabase
      .from('clients')
      .select('onboarding_data')
      .eq('id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching client:', error);
    } else if (client && client.onboarding_data) {
      initialData = client.onboarding_data;
      clientExists = true;
    }
  }

  // If clientId is 'new', we're creating a new onboarding
  const isNewClient = clientId === 'new';
  const effectiveClientId = isNewClient ? undefined : clientId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-10 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-10">
          <a
            href={`/${locale}/dashboard`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {dictionary.dashboard.title}
          </a>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <a
            href={`/${locale}/clients`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {dictionary.dashboard.clients}
          </a>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-foreground font-medium">{dictionary.onboarding.title}</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {dictionary.onboarding.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {dictionary.onboarding.subtitle}
          </p>
        </div>

        {/* Form */}
        <OnboardingForm
          locale={locale}
          dictionary={dictionary}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
