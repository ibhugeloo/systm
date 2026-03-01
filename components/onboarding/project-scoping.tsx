'use client';

import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OnboardingFormData } from '@/types/onboarding';
import {
  User,
  FileText,
  KeyRound,
  Scale,
  Rocket,
  PackageCheck,
  Check,
} from 'lucide-react';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface ProjectScopingProps {
  data: Partial<OnboardingFormData>;
  onChange: (data: Partial<OnboardingFormData>) => void;
  dictionary: Dictionary;
}

interface ChecklistSection {
  id: string;
  titleKey: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: Array<{
    key: string;
    labelKey: string;
  }>;
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'content',
    titleKey: 'section_content',
    icon: FileText,
    iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400',
    items: [
      { key: 'logo_received', labelKey: 'check_logo_received' },
      { key: 'brand_guidelines_received', labelKey: 'check_brand_guidelines_received' },
      { key: 'page_texts_received', labelKey: 'check_page_texts_received' },
      { key: 'visuals_received', labelKey: 'check_visuals_received' },
      { key: 'social_links_received', labelKey: 'check_social_links_received' },
      { key: 'legal_info_received', labelKey: 'check_legal_info_received' },
      { key: 'cgv_cgu_received', labelKey: 'check_cgv_cgu_received' },
      { key: 'translated_content_received', labelKey: 'check_translated_content_received' },
      { key: 'cms_content_received', labelKey: 'check_cms_content_received' },
    ],
  },
  {
    id: 'access',
    titleKey: 'section_access',
    icon: KeyRound,
    iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
    items: [
      { key: 'dns_access', labelKey: 'check_dns_access' },
      { key: 'google_search_console', labelKey: 'check_google_search_console' },
      { key: 'google_analytics', labelKey: 'check_google_analytics' },
      { key: 'stripe_keys', labelKey: 'check_stripe_keys' },
      { key: 'resend_keys', labelKey: 'check_resend_keys' },
      { key: 'supabase_keys', labelKey: 'check_supabase_keys' },
      { key: 'sanity_access', labelKey: 'check_sanity_access' },
    ],
  },
  {
    id: 'compliance',
    titleKey: 'section_compliance',
    icon: Scale,
    iconColor: 'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400',
    items: [
      { key: 'legal_mentions', labelKey: 'check_legal_mentions' },
      { key: 'privacy_policy', labelKey: 'check_privacy_policy' },
      { key: 'cookie_banner', labelKey: 'check_cookie_banner' },
      { key: 'cgv_ready', labelKey: 'check_cgv_ready' },
      { key: 'cgu_ready', labelKey: 'check_cgu_ready' },
    ],
  },
  {
    id: 'preprod',
    titleKey: 'section_preprod',
    icon: Rocket,
    iconColor: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400',
    items: [
      { key: 'functional_tests', labelKey: 'check_functional_tests' },
      { key: 'responsive_verified', labelKey: 'check_responsive_verified' },
      { key: 'seo_configured', labelKey: 'check_seo_configured' },
      { key: 'search_console_connected', labelKey: 'check_search_console_connected' },
      { key: 'analytics_operational', labelKey: 'check_analytics_operational' },
      { key: 'stripe_production', labelKey: 'check_stripe_production' },
      { key: 'emails_tested', labelKey: 'check_emails_tested' },
      { key: 'custom_domain', labelKey: 'check_custom_domain' },
      { key: 'ssl_active', labelKey: 'check_ssl_active' },
      { key: 'lighthouse_ok', labelKey: 'check_lighthouse_ok' },
    ],
  },
  {
    id: 'delivery',
    titleKey: 'section_delivery',
    icon: PackageCheck,
    iconColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
    items: [
      { key: 'client_validated', labelKey: 'check_client_validated' },
      { key: 'final_invoice_paid', labelKey: 'check_final_invoice_paid' },
      { key: 'documentation_delivered', labelKey: 'check_documentation_delivered' },
      { key: 'training_done', labelKey: 'check_training_done' },
      { key: 'access_transferred', labelKey: 'check_access_transferred' },
      { key: 'maintenance_proposed', labelKey: 'check_maintenance_proposed' },
    ],
  },
];

export function ProjectScoping({
  data,
  onChange,
  dictionary,
}: ProjectScopingProps): React.ReactElement {
  const dict = dictionary.onboarding;

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      onChange({ ...data, [field]: value });
    },
    [data, onChange]
  );

  const handleCheckboxToggle = useCallback(
    (key: string) => {
      onChange({ ...data, [key]: !(data as Record<string, unknown>)[key] });
    },
    [data, onChange]
  );

  const getCheckedCount = (section: ChecklistSection): number => {
    return section.items.filter(
      (item) => (data as Record<string, unknown>)[item.key] === true
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Coordonnées client */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">{dict.section_coordinates}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {dict.contact_email_label}
              </label>
              <Input
                type="email"
                placeholder={dict.contact_email_placeholder}
                value={data.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {dict.contact_phone_label}
              </label>
              <Input
                type="tel"
                placeholder={dict.contact_phone_placeholder}
                value={data.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {dict.siret_label}
              </label>
              <Input
                placeholder={dict.siret_placeholder}
                value={data.siret || ''}
                onChange={(e) => handleInputChange('siret', e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {dict.address_label}
              </label>
              <Input
                placeholder={dict.address_placeholder}
                value={data.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklists */}
      {CHECKLIST_SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        const checked = getCheckedCount(section);
        const total = section.items.length;

        return (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center',
                      section.iconColor
                    )}
                  >
                    <SectionIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold">{dict[section.titleKey]}</h3>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    checked === total
                      ? 'text-emerald-600'
                      : 'text-muted-foreground'
                  )}
                >
                  {checked}/{total}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.items.map((item) => {
                  const isChecked =
                    (data as Record<string, unknown>)[item.key] === true;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleCheckboxToggle(item.key)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all',
                        isChecked
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                          : 'bg-muted/30 text-foreground hover:bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isChecked && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className={cn(isChecked && 'line-through opacity-70')}>
                        {dict[item.labelKey]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
