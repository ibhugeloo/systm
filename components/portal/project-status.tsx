'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProjectStatusProps {
  status: string;
  companyName: string;
}

const STEPS = [
  { key: 'onboarding', label: 'Onboarding', description: 'Définition du besoin' },
  { key: 'mvp_generated', label: 'MVP', description: 'Prototype généré' },
  { key: 'demo_scheduled', label: 'Démo planifiée', description: 'Présentation prévue' },
  { key: 'demo_done', label: 'Démo terminée', description: 'Retours intégrés' },
  { key: 'handoff_sent', label: 'Handoff', description: 'Spécifications envoyées' },
  { key: 'in_production', label: 'Production', description: 'Développement en cours' },
  { key: 'closed', label: 'Terminé', description: 'Projet livré' },
];

const STATUS_ORDER = STEPS.map((s) => s.key);

export default function ProjectStatus({ status, companyName }: ProjectStatusProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const progress = currentIndex >= 0
    ? Math.round(((currentIndex + 1) / STEPS.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{companyName}</CardTitle>
          <Badge className="text-xs">{STEPS[currentIndex]?.label || status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        <div className="space-y-2">
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isCurrent ? 'bg-primary/5' : ''
                }`}
              >
                {isCompleted ? (
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {isCurrent ? (
                      <Circle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <p className={`text-sm ${
                    isCurrent ? 'font-semibold' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    isCurrent ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
