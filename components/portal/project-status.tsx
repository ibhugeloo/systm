'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{companyName}</CardTitle>
          <Badge>{STEPS[currentIndex]?.label || status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
                ) : (
                  <Circle className="h-5 w-5 flex-shrink-0 text-gray-300" />
                )}
                <div>
                  <p className={`text-sm ${isCurrent ? 'font-semibold' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
