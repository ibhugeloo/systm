export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Eye, Building2, Plus } from 'lucide-react';
import Link from 'next/link';

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

// All checklist keys from onboarding_data
const ALL_CHECKLIST_KEYS = [
  // Content
  'logo_received', 'brand_guidelines_received', 'page_texts_received',
  'visuals_received', 'social_links_received', 'legal_info_received',
  'cgv_cgu_received', 'translated_content_received', 'cms_content_received',
  // Access
  'dns_access', 'google_search_console', 'google_analytics',
  'stripe_keys', 'resend_keys', 'supabase_keys', 'sanity_access',
  // Compliance
  'legal_mentions', 'privacy_policy', 'cookie_banner', 'cgv_ready', 'cgu_ready',
  // Preprod
  'functional_tests', 'responsive_verified', 'seo_configured',
  'search_console_connected', 'analytics_operational', 'stripe_production',
  'emails_tested', 'custom_domain', 'ssl_active', 'lighthouse_ok',
  // Delivery
  'client_validated', 'final_invoice_paid', 'documentation_delivered',
  'training_done', 'access_transferred', 'maintenance_proposed',
];

function calculateProgress(onboardingData: Record<string, unknown> | null): number {
  if (!onboardingData) return 0;
  const checked = ALL_CHECKLIST_KEYS.filter((key) => onboardingData[key] === true).length;
  return Math.round((checked / ALL_CHECKLIST_KEYS.length) * 100);
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  mvp_generated: { label: 'MVP Généré', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  demo_scheduled: { label: 'Démo Prévue', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  demo_done: { label: 'Démo Terminée', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  handoff_sent: { label: 'Handoff Envoyé', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  in_production: { label: 'En Production', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  closed: { label: 'Clôturé', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

export default async function OnboardingListPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, sector, status, tech_stack, onboarding_data, problem_description')
    .order('created_at', { ascending: false });

  const count = clients?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Suivi de progression par projet ({count} projet{count > 1 ? 's' : ''})
          </p>
        </div>
        <Link href={`/${locale}/dashboard/onboarding/new`}>
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Créer un Onboarding
          </Button>
        </Link>
      </div>

      {/* Onboarding Cards */}
      {(!clients || clients.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun onboarding en cours</p>
            <Link href={`/${locale}/dashboard/onboarding/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un Onboarding
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => {
            const progress = calculateProgress(client.onboarding_data as Record<string, unknown> | null);
            const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.onboarding;
            const techStack = (client.tech_stack || []) as string[];

            return (
              <Card key={client.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{client.company_name}</h3>
                      {client.sector && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <Building2 className="h-3 w-3" />
                          {client.sector}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Problem description */}
                  {client.problem_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {client.problem_description}
                    </p>
                  )}

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">Progression Onboarding</span>
                      <span className={`text-sm font-bold tabular-nums ${progress === 100 ? 'text-emerald-600' : 'text-primary'}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tech stack badges */}
                  {techStack.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">Fonctionnalités :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {techStack.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {techStack.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{techStack.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <Link href={`/${locale}/dashboard/onboarding/${client.id}`} className="block pt-2">
                    <Button className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      Voir l&apos;Onboarding
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
