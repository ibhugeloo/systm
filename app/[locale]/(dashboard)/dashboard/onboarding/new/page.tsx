export const dynamic = 'force-dynamic';

import { getDictionary } from '@/lib/get-dictionaries';
import { createClient } from '@/lib/supabase/server';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';
import { Locale } from '@/lib/i18n-config';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface NewOnboardingPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function NewOnboardingPage({ params }: NewOnboardingPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, sector')
    .order('company_name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-10 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-10">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/dashboard`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/dashboard/onboarding`}>Onboarding</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nouvel Onboarding</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Nouvel Onboarding
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Configurez le projet étape par étape
          </p>
        </div>

        {/* Form */}
        <OnboardingForm
          locale={locale}
          dictionary={dictionary}
          clients={clients || []}
        />
      </div>
    </div>
  );
}
