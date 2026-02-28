'use client';

import React, { useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OnboardingStep2Data } from '@/types/onboarding';

interface Dictionary {
  onboarding: Record<string, string>;
}

interface TechConstraintsProps {
  data: Partial<OnboardingStep2Data>;
  onChange: (data: Partial<OnboardingStep2Data>) => void;
  dictionary: Dictionary;
  errors?: Record<string, string[]>;
}

const TECH_STACK_OPTIONS = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Node.js',
  'Python',
  'Django',
  'Rails',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'GCP',
  'Azure',
  'Supabase',
  'Firebase',
];

const INTEGRATION_OPTIONS = [
  'Stripe',
  'Twilio',
  'SendGrid',
  'Salesforce',
  'HubSpot',
  'Slack',
  'Zapier',
  'Custom API',
];

export function TechConstraints({
  data,
  onChange,
  dictionary,
  errors = {},
}: TechConstraintsProps): React.ReactElement {
  const dict = dictionary.onboarding;

  const handleStackToggle = useCallback(
    (technology: string) => {
      const currentStack = data.existing_stack || [];
      const updated = currentStack.includes(technology)
        ? currentStack.filter((t) => t !== technology)
        : [...currentStack, technology];
      onChange({ ...data, existing_stack: updated });
    },
    [data, onChange]
  );

  const handleIntegrationToggle = useCallback(
    (integration: string) => {
      const currentIntegrations = data.required_integrations || [];
      const updated = currentIntegrations.includes(integration)
        ? currentIntegrations.filter((i) => i !== integration)
        : [...currentIntegrations, integration];
      onChange({ ...data, required_integrations: updated });
    },
    [data, onChange]
  );

  const handleTechConstraintsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...data, tech_constraints: e.target.value });
    },
    [data, onChange]
  );

  const getFieldError = (field: string): string | undefined => {
    const fieldErrors = errors[field];
    return fieldErrors?.[0];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.step_2}</CardTitle>
        <CardDescription>{dict.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Tech Stack */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {dict.existing_stack_label}
            <span className="text-gray-400 ml-1 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {TECH_STACK_OPTIONS.map((tech) => (
              <label
                key={tech}
                className="flex items-center gap-2 p-3 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(data.existing_stack || []).includes(tech)}
                  onChange={() => handleStackToggle(tech)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{tech}</span>
              </label>
            ))}
          </div>
          {getFieldError('existing_stack') && (
            <p className="text-sm text-red-500">{getFieldError('existing_stack')}</p>
          )}
        </div>

        {/* Tech Constraints */}
        <div className="space-y-2">
          <label htmlFor="tech_constraints" className="block text-sm font-medium">
            {dict.tech_constraints_label}
            <span className="text-gray-400 ml-1 font-normal">(optional)</span>
          </label>
          <Textarea
            id="tech_constraints"
            placeholder={dict.tech_constraints_placeholder}
            value={data.tech_constraints || ''}
            onChange={handleTechConstraintsChange}
            className={cn(getFieldError('tech_constraints') && 'border-red-500 focus-visible:ring-red-500')}
          />
          {getFieldError('tech_constraints') && (
            <p className="text-sm text-red-500">{getFieldError('tech_constraints')}</p>
          )}
        </div>

        {/* Required Integrations */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {dict.required_integrations_label}
            <span className="text-gray-400 ml-1 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INTEGRATION_OPTIONS.map((integration) => (
              <label
                key={integration}
                className="flex items-center gap-2 p-3 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(data.required_integrations || []).includes(integration)}
                  onChange={() => handleIntegrationToggle(integration)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{integration}</span>
              </label>
            ))}
          </div>
          {getFieldError('required_integrations') && (
            <p className="text-sm text-red-500">{getFieldError('required_integrations')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
