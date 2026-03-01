export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageCircle,
  Building2,
  Mail,
  User,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import ClientStatusSelect from '@/components/clients/client-status-select';
import ClientInfoEditor from '@/components/clients/client-info-editor';
import ProjectFigmaPrompt from './project-figma-prompt';

interface ProjectPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

const QUICK_ACTIONS = [
  { key: 'conversation', label: 'Discussion', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50' },
  { key: 'requests', label: 'Requêtes', icon: ClipboardList, color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:group-hover:bg-amber-900/50' },
];

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  const { data: requests } = await supabase
    .from('client_requests')
    .select('id, title, type, status, priority, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: mvp } = await supabase
    .from('mvps')
    .select('id, generated_prompt, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const basePath = `/${locale}/dashboard/projects/${clientId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/dashboard`}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${locale}/dashboard/projects`}>Projets</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{client.company_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
      <div className="grid grid-cols-2 gap-3 max-w-xs">
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Figma Make Prompt */}
        <div className="lg:col-span-2">
          <ProjectFigmaPrompt
            clientId={clientId}
            client={{
              company_name: client.company_name,
              sector: client.sector || '',
              problem_description: client.problem_description || '',
            }}
            existingPrompt={mvp?.generated_prompt || null}
            mvpId={mvp?.id || null}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
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
