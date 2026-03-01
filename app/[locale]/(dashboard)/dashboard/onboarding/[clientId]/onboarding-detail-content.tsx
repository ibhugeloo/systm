'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Check, FileText, KeyRound, Scale, Rocket, PackageCheck, CreditCard, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface OnboardingDetailContentProps {
  locale: string;
  client: {
    id: string;
    company_name: string;
    sector: string;
    status: string;
    tech_stack: string[];
    onboarding_data: Record<string, unknown>;
  };
}

interface WidgetSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: Array<{ key: string; label: string }>;
}

const WIDGET_SECTIONS: WidgetSection[] = [
  {
    id: 'cadrage',
    title: 'Cadrage & Paiement',
    icon: CreditCard,
    iconColor: 'text-blue-600 bg-blue-50',
    items: [
      { key: 'client_brief_done', label: 'Infos Client & Brief' },
      { key: 'devis_sent', label: 'Devis & Acompte (20%)' },
      { key: 'acompte_paid', label: 'Acompte 20% Payé' },
    ],
  },
  {
    id: 'tech_accounts',
    title: 'Comptes Techniques',
    icon: KeyRound,
    iconColor: 'text-amber-600 bg-amber-50',
    items: [
      { key: 'github_setup', label: 'GitHub' },
      { key: 'supabase_keys', label: 'Supabase' },
      { key: 'stripe_keys', label: 'Stripe' },
      { key: 'vercel_setup', label: 'Vercel' },
    ],
  },
  {
    id: 'content',
    title: 'Contenu & Légal',
    icon: FileText,
    iconColor: 'text-violet-600 bg-violet-50',
    items: [
      { key: 'logo_received', label: 'Logo' },
      { key: 'brand_guidelines_received', label: 'Charte Graphique' },
      { key: 'page_texts_received', label: 'Textes des Pages' },
      { key: 'visuals_received', label: 'Visuels' },
      { key: 'legal_mentions', label: 'Mentions Légales' },
      { key: 'privacy_policy', label: 'Politique de Confidentialité' },
      { key: 'cgv_ready', label: 'CGV' },
      { key: 'cgu_ready', label: 'CGU' },
    ],
  },
  {
    id: 'dev',
    title: 'Développement & Livraison',
    icon: Rocket,
    iconColor: 'text-emerald-600 bg-emerald-50',
    items: [
      { key: 'functional_tests', label: 'Développement & Tests' },
      { key: 'responsive_verified', label: 'Responsive Vérifié' },
      { key: 'seo_configured', label: 'SEO Configuré' },
      { key: 'custom_domain', label: 'Domaine Personnalisé' },
      { key: 'ssl_active', label: 'SSL Actif' },
      { key: 'client_validated', label: 'Validation Client' },
      { key: 'documentation_delivered', label: 'Documentation Livrée' },
      { key: 'access_transferred', label: 'Accès Transférés' },
    ],
  },
];

const ALL_KEYS = WIDGET_SECTIONS.flatMap((s) => s.items.map((i) => i.key));

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  mvp_generated: { label: 'MVP Généré', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  demo_scheduled: { label: 'Démo Prévue', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  demo_done: { label: 'Démo Terminée', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  handoff_sent: { label: 'Handoff Envoyé', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  in_production: { label: 'En Production', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  closed: { label: 'Clôturé', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

export default function OnboardingDetailContent({ locale, client }: OnboardingDetailContentProps) {
  const [data, setData] = useState<Record<string, unknown>>(client.onboarding_data);
  const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.onboarding;

  const checkedCount = ALL_KEYS.filter((key) => data[key] === true).length;
  const progress = Math.round((checkedCount / ALL_KEYS.length) * 100);

  const toggleItem = useCallback(async (key: string) => {
    const newData = { ...data, [key]: !data[key] };
    setData(newData);

    // Save to Supabase
    const supabase = createClient();
    const { error } = await supabase
      .from('clients')
      .update({ onboarding_data: newData })
      .eq('id', client.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      setData(data); // revert
    }
  }, [data, client.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/${locale}/dashboard/onboarding`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux onboardings
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{client.company_name}</h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusConfig.bg} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
        {client.sector && (
          <p className="text-muted-foreground mt-1">{client.sector}</p>
        )}
      </div>

      {/* Global Progress */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">Progression Onboarding</h2>
            <span className={`text-xl font-bold tabular-nums ${progress === 100 ? 'text-emerald-600' : 'text-primary'}`}>
              {progress}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress === 100 ? 'bg-emerald-500' : 'bg-primary'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WIDGET_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const sectionChecked = section.items.filter((i) => data[i.key] === true).length;
          const sectionTotal = section.items.length;

          return (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', section.iconColor)}>
                      <SectionIcon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <span className={cn(
                    'text-xs font-medium tabular-nums',
                    sectionChecked === sectionTotal ? 'text-emerald-600' : 'text-muted-foreground'
                  )}>
                    {sectionChecked}/{sectionTotal}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {section.items.map((item) => {
                  const isChecked = data[item.key] === true;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleItem(item.key)}
                      className={cn(
                        'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all',
                        isChecked
                          ? 'bg-emerald-50 dark:bg-emerald-950/20'
                          : 'bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-muted-foreground/30'
                        )}>
                          {isChecked && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn(isChecked && 'line-through opacity-70')}>
                          {item.label}
                        </span>
                      </div>
                      {!isChecked && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                          en attente
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
