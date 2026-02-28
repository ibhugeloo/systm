'use client';

import { useParams } from 'next/navigation';
import { usePortalClient } from '@/providers/portal-client-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Calendar,
  MessageCircle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Layout,
  PartyPopper,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_PROGRESS: Record<string, number> = {
  onboarding: 10,
  mvp_generated: 30,
  demo_scheduled: 45,
  demo_done: 60,
  handoff_sent: 80,
  in_production: 90,
  closed: 100,
};

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding en cours',
  mvp_generated: 'MVP généré',
  demo_scheduled: 'Démo planifiée',
  demo_done: 'Démo terminée',
  handoff_sent: 'Spécifications envoyées',
  in_production: 'En production',
  closed: 'Projet terminé',
};

const STATUS_STEPS = [
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'mvp_generated', label: 'MVP' },
  { key: 'demo_scheduled', label: 'Démo' },
  { key: 'handoff_sent', label: 'Handoff' },
  { key: 'in_production', label: 'Production' },
  { key: 'closed', label: 'Livré' },
];

const STATUS_ORDER = ['onboarding', 'mvp_generated', 'demo_scheduled', 'demo_done', 'handoff_sent', 'in_production', 'closed'];

const REQUEST_STATUS: Record<string, string> = {
  pending: 'En attente',
  in_review: 'En cours',
  done: 'Terminé',
  rejected: 'Rejeté',
};

const TYPE_LABELS: Record<string, string> = {
  feature: 'Fonctionnalité',
  bug: 'Bug',
  meeting: 'Réunion',
  question: 'Question',
};

export default function PortalPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { client, mvpCanvas, requests, isLoading, isProjectFinished } = usePortalClient();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Bienvenue sur systm.re</h1>
        <p className="text-muted-foreground max-w-md">
          Aucun projet trouvé pour votre compte. Contactez notre équipe pour commencer.
        </p>
      </div>
    );
  }

  // Project finished view
  if (isProjectFinished) {
    return (
      <div className="space-y-8 p-6 max-w-4xl mx-auto">
        {/* Hero terminé */}
        <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Projet terminé !
            </h1>
            <p className="text-muted-foreground max-w-md">
              Votre projet {client.company_name} a été livré avec succès. Vous pouvez toujours nous contacter via le support.
            </p>
            <Badge className="bg-emerald-500 text-white text-sm px-3 py-1">
              100% complété
            </Badge>
          </CardContent>
        </Card>

        {/* Quick Actions (support + requêtes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/${locale}/portal/support`}>
            <Card className="group hover:shadow-lg hover:border-purple-200 transition-all duration-200 cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-semibold">Support</p>
                <p className="text-xs text-muted-foreground text-center">
                  Contactez notre équipe pour toute question
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${locale}/portal/requests`}>
            <Card className="group hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-semibold">Requêtes</p>
                <p className="text-xs text-muted-foreground text-center">
                  Demander une modification ou signaler un bug
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Requests */}
        {requests.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Vos dernières requêtes</CardTitle>
                <Link href={`/${locale}/portal/requests`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Tout voir
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{req.title}</p>
                        <p className="text-xs text-muted-foreground">{TYPE_LABELS[req.type] || req.type}</p>
                      </div>
                    </div>
                    <Badge variant={req.status === 'done' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {REQUEST_STATUS[req.status] || req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Project in progress view
  const progress = STATUS_PROGRESS[client.status] || 0;
  const currentStepIndex = STATUS_ORDER.indexOf(client.status);

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bonjour, {client.contact_name || client.company_name}
        </h1>
        <p className="text-muted-foreground mt-1">Voici l&apos;état de votre projet</p>
      </div>

      {/* Project Status */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Statut du projet</CardTitle>
            <Badge className="text-xs">{STATUS_LABELS[client.status] || client.status}</Badge>
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

          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step) => {
              const stepIdx = STATUS_ORDER.indexOf(step.key);
              const isCompleted = stepIdx <= currentStepIndex;
              const isCurrent = step.key === client.status || (step.key === 'demo_scheduled' && client.status === 'demo_done');

              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? isCurrent
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${
                    isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 gap-4 ${mvpCanvas ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {mvpCanvas && (
          <Link href={`/${locale}/portal/mockup`}>
            <Card className="group hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <Layout className="h-6 w-6 text-indigo-600" />
                </div>
                <p className="font-semibold">Maquette</p>
                <p className="text-xs text-muted-foreground text-center">
                  Voir la maquette de votre projet
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href={`/${locale}/portal/support`}>
          <Card className="group hover:shadow-lg hover:border-purple-200 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-semibold">Support</p>
              <p className="text-xs text-muted-foreground text-center">
                Discutez avec notre équipe
              </p>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/portal/requests`}>
          <Card className="group hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-semibold">Requêtes</p>
              <p className="text-xs text-muted-foreground text-center">
                Demander une fonctionnalité ou signaler un bug
              </p>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/portal/booking`}>
          <Card className="group hover:shadow-lg hover:border-amber-200 transition-all duration-200 cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <p className="font-semibold">Rendez-vous</p>
              <p className="text-xs text-muted-foreground text-center">
                Planifier un appel avec notre équipe
              </p>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Vos dernières requêtes</CardTitle>
              <Link href={`/${locale}/portal/requests`}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Tout voir
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{TYPE_LABELS[req.type] || req.type}</p>
                    </div>
                  </div>
                  <Badge variant={req.status === 'done' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                    {REQUEST_STATUS[req.status] || req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
