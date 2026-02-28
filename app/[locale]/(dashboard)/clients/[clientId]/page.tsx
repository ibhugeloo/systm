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

export default async function ClientPage({ params }: ClientPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();
  const dict = await getDictionary(locale as 'fr' | 'en');

  // Fetch client
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  // Fetch latest MVP
  const { data: mvp } = await supabase
    .from('mvps')
    .select('id, status, version, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch pending requests
  const { data: requests } = await supabase
    .from('client_requests')
    .select('id, title, type, status, priority, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch handoff
  const { data: handoff } = await supabase
    .from('handoffs')
    .select('id, status')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const basePath = `/${locale}/dashboard/clients/${clientId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{client.company_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <ClientStatusSelect clientId={clientId} currentStatus={client.status} />
            <span className="text-sm text-muted-foreground">{client.sector}</span>
            {client.contact_email && (
              <span className="text-sm text-muted-foreground">{client.contact_email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link href={`${basePath}/onboarding`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <FileText className="h-5 w-5" />
            <span className="text-xs">Onboarding</span>
          </Button>
        </Link>
        <Link href={`${basePath}/mvp`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <Monitor className="h-5 w-5" />
            <span className="text-xs">MVP</span>
          </Button>
        </Link>
        <Link href={`${basePath}/demo`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <Monitor className="h-5 w-5" />
            <span className="text-xs">Démo</span>
          </Button>
        </Link>
        <Link href={`${basePath}/conversation`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Discussion</span>
          </Button>
        </Link>
        <Link href={`${basePath}/handoff`}>
          <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
            <Send className="h-5 w-5" />
            <span className="text-xs">Handoff</span>
          </Button>
        </Link>
      </div>

      {/* Client Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Informations</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Problème</p>
              <p className="mt-1">{client.problem_description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="mt-1">{client.budget_range}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Timeline</p>
                <p className="mt-1">{client.timeline}</p>
              </div>
            </div>
            {client.tech_stack && client.tech_stack.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stack technique</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.tech_stack.map((tech: string) => (
                    <Badge key={tech} variant="secondary">{tech}</Badge>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">MVP</CardTitle>
            </CardHeader>
            <CardContent>
              {mvp ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{mvp.status}</Badge>
                    <span className="text-xs text-muted-foreground">v{mvp.version}</span>
                  </div>
                  <Link href={`${basePath}/mvp`}>
                    <Button size="sm" className="w-full mt-2">Voir le MVP</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">Aucun MVP</p>
                  <Link href={`${basePath}/onboarding`}>
                    <Button size="sm" variant="outline">Commencer</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Requêtes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {requests && requests.length > 0 ? (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{req.title}</span>
                      <Badge variant="outline" className="text-xs ml-2">{req.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
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
