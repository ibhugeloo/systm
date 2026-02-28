export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

const STATUS_COLUMNS = [
  'onboarding',
  'mvp_generated',
  'demo_scheduled',
  'demo_done',
  'handoff_sent',
  'in_production',
  'closed',
] as const;

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  mvp_generated: 'MVP Généré',
  demo_scheduled: 'Démo Prévue',
  demo_done: 'Démo Terminée',
  handoff_sent: 'Handoff Envoyé',
  in_production: 'En Production',
  closed: 'Clôturé',
};

const STATUS_COLORS: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  mvp_generated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  demo_scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  demo_done: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  handoff_sent: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  in_production: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const dict = await getDictionary(locale as 'fr' | 'en');

  // Fetch all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name, contact_name, sector, status, assigned_to, created_at')
    .order('created_at', { ascending: false });

  // Fetch pending requests count
  const { count: pendingRequests } = await supabase
    .from('client_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Group clients by status
  const clientsByStatus: Record<string, typeof clients> = {};
  STATUS_COLUMNS.forEach((status) => {
    clientsByStatus[status] = (clients || []).filter((c) => c.status === status);
  });

  const totalClients = clients?.length || 0;
  const activeClients = (clients || []).filter(
    (c) => !['closed'].includes(c.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">{dict.dashboard.pipeline}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{dict.dashboard.active_clients}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">sur {totalClients} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MVPs Générés</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(clientsByStatus['mvp_generated']?.length || 0) +
                (clientsByStatus['demo_scheduled']?.length || 0) +
                (clientsByStatus['demo_done']?.length || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{dict.dashboard.handoff_sent}</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsByStatus['handoff_sent']?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{dict.dashboard.pending_requests}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {STATUS_COLUMNS.map((status) => (
            <div key={status} className="w-64 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold">{STATUS_LABELS[status]}</h3>
                <Badge variant="secondary" className="text-xs">
                  {clientsByStatus[status]?.length || 0}
                </Badge>
              </div>

              <div className="space-y-2">
                {(clientsByStatus[status] || []).map((client) => (
                  <Link
                    key={client.id}
                    href={`/${locale}/dashboard/clients/${client.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate">{client.company_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{client.sector}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                            {STATUS_LABELS[status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(client.created_at).toLocaleDateString(locale)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {(!clientsByStatus[status] || clientsByStatus[status]!.length === 0) && (
                  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center text-xs text-muted-foreground">
                    Aucun client
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
