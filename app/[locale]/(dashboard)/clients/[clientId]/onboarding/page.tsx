export const dynamic = 'force-dynamic';

import React from 'react';
import { getDictionary } from '@/lib/get-dictionaries';
import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { Locale } from '@/lib/i18n-config';


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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <a href={`/${locale}/dashboard`} className="hover:text-foreground transition-colors">
            {dictionary.dashboard.title}
          </a>
          <span>/</span>
          <a href={`/${locale}/clients`} className="hover:text-foreground transition-colors">
            {dictionary.dashboard.clients}
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">{dictionary.onboarding.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {dictionary.onboarding.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {dictionary.onboarding.subtitle}
          </p>
        </div>

        {/* Form */}
        <OnboardingForm
          clientId={effectiveClientId}
          locale={locale}
          dictionary={dictionary}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
