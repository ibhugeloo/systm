export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import NewProjectForm from './new-project-form';

interface NewProjectPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, sector')
    .order('company_name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-10 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-10">
          <Link
            href={`/${locale}/dashboard/projects`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Projets
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          <span className="text-foreground font-medium">Nouveau projet</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Nouveau projet
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Décrivez le projet et générez le prompt Figma Make
          </p>
        </div>

        {/* Form */}
        <NewProjectForm
          locale={locale}
          clients={clients || []}
        />
      </div>
    </div>
  );
}
