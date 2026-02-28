export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/get-dictionaries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  MessageCircle,
  Monitor,
  Send,
  ArrowLeft,
  Building2,
  Mail,
  User,
  Wallet,
  Clock,
  Code2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import ClientStatusSelect from '@/components/clients/client-status-select';
import ClientInfoEditor from '@/components/clients/client-info-editor';

interface ClientPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

const QUICK_ACTIONS = [
  { key: 'onboarding', label: 'Onboarding', icon: FileText, color: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100' },
  { key: 'mvp', label: 'MVP', icon: Code2, color: 'text-violet-600 bg-violet-50 group-hover:bg-violet-100' },
  { key: 'demo', label: 'Démo', icon: Monitor, color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100' },
  { key: 'conversation', label: 'Discussion', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100' },
  { key: 'handoff', label: 'Handoff', icon: Send, color: 'text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100' },
];

export default async function ClientPage({ params }: ClientPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();
  const dict = await getDictionary(locale as 'fr');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  const { data: mvp } = await supabase
    .from('mvps')
    .select('id, status, version, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: requests } = await supabase
    .from('client_requests')
    .select('id, title, type, status, priority, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  const basePath = `/${locale}/dashboard/clients/${clientId}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          href={`/${locale}/dashboard/clients`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux clients
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{client.company_name}</h1>
              <ClientStatusSelect clientId={clientId} currentStatus={client.status} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {client.sector && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {client.sector}
                </span>
              )}
              {client.contact_name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {client.contact_name}
                </span>
              )}
              {client.contact_email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {client.contact_email}
                </span>
              )}
            </div>
          </div>
          <ClientInfoEditor
            clientId={clientId}
            initialData={{
              company_name: client.company_name,
              contact_name: client.contact_name,
              contact_email: client.contact_email,
              sector: client.sector,
              problem_description: client.problem_description,
              budget_range: client.budget_range,
              timeline: client.timeline,
            }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.key} href={`${basePath}/${action.key}`}>
            <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-transparent hover:border-primary/10">
              <CardContent className="flex flex-col items-center gap-2 py-4 px-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Informations du projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {client.problem_description && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Problème identifié</p>
                <p className="text-sm leading-relaxed">{client.problem_description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {client.budget_range && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Wallet className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="text-sm font-medium truncate">{client.budget_range}</p>
                  </div>
                </div>
              )}
              {client.timeline && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Délai</p>
                    <p className="text-sm font-medium truncate">{client.timeline}</p>
                  </div>
                </div>
              )}
              {client.contact_email && (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium truncate">{client.contact_email}</p>
                  </div>
                </div>
              )}
            </div>

            {client.tech_stack && client.tech_stack.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  Stack technique
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {client.tech_stack.map((tech: string) => (
                    <Badge key={tech} variant="secondary" className="font-mono text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* MVP Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Code2 className="h-4 w-4 text-violet-500" />
                MVP
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mvp ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{mvp.status}</Badge>
                    <span className="text-xs text-muted-foreground font-mono">v{mvp.version}</span>
                  </div>
                  <Link href={`${basePath}/mvp`}>
                    <Button size="sm" className="w-full gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      Voir le MVP
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Aucun MVP généré</p>
                  <Link href={`${basePath}/onboarding`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Commencer
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                Requêtes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm truncate flex-1">{req.title}</span>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">{req.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-3">
                  Aucune requête
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
