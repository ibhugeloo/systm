export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, Send, CheckCircle } from 'lucide-react';
import KanbanBoard from '@/components/dashboard/kanban-board';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

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

  const allClients = clients || [];
  const totalClients = allClients.length;
  const activeClients = allClients.filter((c) => c.status !== 'closed').length;
  const mvpCount = allClients.filter((c) =>
    ['mvp_generated', 'demo_scheduled', 'demo_done'].includes(c.status)
  ).length;
  const handoffCount = allClients.filter((c) => c.status === 'handoff_sent').length;

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
            <div className="text-2xl font-bold">{mvpCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{dict.dashboard.handoff_sent}</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handoffCount}</div>
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
      <KanbanBoard clients={allClients} locale={locale} />
    </div>
  );
}
