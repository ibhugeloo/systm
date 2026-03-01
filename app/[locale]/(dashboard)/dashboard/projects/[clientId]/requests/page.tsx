export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface RequestsPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
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

export default async function RequestsPage({ params }: RequestsPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, company_name')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    notFound();
  }

  // Fetch requests
  const { data: requests } = await supabase
    .from('client_requests')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}/dashboard`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}/dashboard/projects/${clientId}`}>{client.company_name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Requêtes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold">Requêtes - {client.company_name}</h1>
        <p className="text-muted-foreground mt-1">
          {requests?.length || 0} requête{(requests?.length || 0) > 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-3">
        {(!requests || requests.length === 0) ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune requête pour le moment
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{req.title}</h3>
                      <Badge variant="outline">{TYPE_LABELS[req.type] || req.type}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                  </div>
                  <Badge variant={req.status === 'done' ? 'default' : 'secondary'}>
                    {STATUS_LABELS[req.status] || req.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(req.created_at).toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
