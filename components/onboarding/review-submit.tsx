'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingFormData } from '@/types/onboarding';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface ReviewSubmitProps {
  formData: Partial<OnboardingFormData>;
  onSubmit: () => Promise<void>;
  onEdit: (step: 1 | 2 | 3) => void;
  isSubmitting: boolean;
  dictionary: Dictionary;
}

export function ReviewSubmit({
  formData,
  onSubmit,
  onEdit,
  isSubmitting,
  dictionary,
}: ReviewSubmitProps): React.ReactElement {
  const dict = dictionary.onboarding;
  const commonDict = dictionary.common;

  const formatBudgetRange = (range: string | undefined): string => {
    if (!range) return 'N/A';
    const budgetMap: Record<string, string> = {
      '<5k': 'Moins de 5 000 €',
      '5k-15k': '5 000 € - 15 000 €',
      '15k-50k': '15 000 € - 50 000 €',
      '50k-100k': '50 000 € - 100 000 €',
      '>100k': 'Plus de 100 000 €',
    };
    return budgetMap[range] || range;
  };

  const formatTimeline = (timeline: string | undefined): string => {
    if (!timeline) return 'N/A';
    const timelineMap: Record<string, string> = {
      '<1month': 'Moins d\'1 mois',
      '1-3months': '1-3 mois',
      '3-6months': '3-6 mois',
      '>6months': 'Plus de 6 mois',
    };
    return timelineMap[timeline] || timeline;
  };

  const formatPriority = (priority: string | undefined): string => {
    if (!priority) return 'N/A';
    const priorityMap: Record<string, string> = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      critical: 'Critique',
    };
    return priorityMap[priority] || priority;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Step 1: Company Details */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{dict.step_1}</CardTitle>
              <CardDescription>Informations de votre entreprise</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {commonDict.button_edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{dict.company_name_label}</p>
              <p className="font-medium">{formData.company_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{dict.sector_label}</p>
              <p className="font-medium capitalize">{formData.sector || 'N/A'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{dict.problem_description_label}</p>
            <p className="font-medium text-sm leading-relaxed">{formData.problem_description || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{dict.main_objective_label}</p>
            <p className="font-medium">{formData.main_objective || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Tech Stack */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{dict.step_2}</CardTitle>
              <CardDescription>Vos exigences techniques</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {commonDict.button_edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{dict.existing_stack_label}</p>
            {(formData.existing_stack || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.existing_stack?.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune sélection</p>
            )}
          </div>
          {formData.tech_constraints && (
            <div>
              <p className="text-sm text-muted-foreground">{dict.tech_constraints_label}</p>
              <p className="font-medium text-sm">{formData.tech_constraints}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{dict.required_integrations_label}</p>
            {(formData.required_integrations || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.required_integrations?.map((integration) => (
                  <span
                    key={integration}
                    className="inline-flex items-center rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary-foreground"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucune sélection</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Budget & Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{dict.step_3}</CardTitle>
              <CardDescription>Détails du budget et du délai</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {commonDict.button_edit}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{dict.budget_range_label}</p>
              <p className="font-medium text-sm">{formatBudgetRange(formData.budget_range)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{dict.desired_timeline_label}</p>
              <p className="font-medium text-sm">{formatTimeline(formData.desired_timeline)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{dict.priority_label}</p>
              <p className="font-medium text-sm capitalize">{formatPriority(formData.priority)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        size="lg"
        className="w-full gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? commonDict.loading : 'Générer le MVP'}
      </Button>
    </div>
  );
}
