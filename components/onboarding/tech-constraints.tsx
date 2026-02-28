'use client';

import React, { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { OnboardingStep3Data } from '@/types/onboarding';
import {
  Github,
  Database,
  Globe,
  FileText,
  Mail,
  BarChart3,
  CreditCard,
  Shield,
  Link2,
  Check,
  Lock,
} from 'lucide-react';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface TechConstraintsProps {
  data: Partial<OnboardingStep3Data>;
  onChange: (data: Partial<OnboardingStep3Data>) => void;
  dictionary: Dictionary;
  errors?: Record<string, string[]>;
}

interface StackService {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'core' | 'optional' | 'infra';
  alwaysIncluded: boolean;
}

const STACK_SERVICES: StackService[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository du projet',
    icon: Github,
    category: 'core',
    alwaysIncluded: true,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Base de données + Auth + Storage',
    icon: Database,
    category: 'core',
    alwaysIncluded: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Hébergement + Déploiement',
    icon: Globe,
    category: 'core',
    alwaysIncluded: true,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'DNS + Protection + CDN',
    icon: Shield,
    category: 'infra',
    alwaysIncluded: true,
  },
  {
    id: 'domaine',
    name: 'Nom de domaine',
    description: 'Via Cloudflare, OVH, etc.',
    icon: Link2,
    category: 'infra',
    alwaysIncluded: true,
  },
  {
    id: 'sanity',
    name: 'Sanity',
    description: 'CMS — Gestion de contenu',
    icon: FileText,
    category: 'optional',
    alwaysIncluded: false,
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Emails transactionnels',
    icon: Mail,
    category: 'optional',
    alwaysIncluded: false,
  },
  {
    id: 'posthog',
    name: 'PostHog',
    description: 'Analytics + Suivi utilisateurs',
    icon: BarChart3,
    category: 'optional',
    alwaysIncluded: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Paiements en ligne',
    icon: CreditCard,
    category: 'optional',
    alwaysIncluded: false,
  },
];

const CORE_SERVICES = STACK_SERVICES.filter((s) => s.alwaysIncluded);
const OPTIONAL_SERVICES = STACK_SERVICES.filter((s) => !s.alwaysIncluded);
const CORE_SERVICE_NAMES = CORE_SERVICES.map((s) => s.name);

export function TechConstraints({
  data,
  onChange,
  dictionary,
}: TechConstraintsProps): React.ReactElement {
  const dict = dictionary.onboarding;

  // Ensure core services are always in the stack
  useEffect(() => {
    const currentStack = data.existing_stack || [];
    const missingCore = CORE_SERVICE_NAMES.filter((name) => !currentStack.includes(name));
    if (missingCore.length > 0) {
      onChange({
        ...data,
        existing_stack: [...currentStack, ...missingCore],
        tech_constraints: data.tech_constraints || '',
        required_integrations: data.required_integrations || [],
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptionalToggle = useCallback(
    (serviceName: string) => {
      const currentStack = data.existing_stack || [];
      const updated = currentStack.includes(serviceName)
        ? currentStack.filter((s) => s !== serviceName)
        : [...currentStack, serviceName];
      onChange({
        ...data,
        existing_stack: updated,
      });
    },
    [data, onChange]
  );

  const isSelected = (serviceName: string): boolean => {
    return (data.existing_stack || []).includes(serviceName);
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {dict.stack_intro}
        </p>
      </div>

      {/* Core Stack — Always included */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{dict.stack_core_title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_SERVICES.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 p-3.5 rounded-xl border bg-muted/30 border-border/50"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <service.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground truncate">{service.description}</p>
              </div>
              <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">
                {dict.stack_included}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Services — Toggleable */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{dict.stack_optional_title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{dict.stack_optional_desc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPTIONAL_SERVICES.map((service) => {
            const selected = isSelected(service.name);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleOptionalToggle(service.name)}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200',
                  selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                )}
              >
                <div className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                  selected ? 'bg-primary/15' : 'bg-muted'
                )}>
                  <service.icon className={cn(
                    'h-4.5 w-4.5 transition-colors',
                    selected ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium transition-colors',
                    selected ? 'text-primary' : 'text-foreground'
                  )}>{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
                <div className={cn(
                  'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  selected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                )}>
                  {selected && <Check className="h-3 w-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
