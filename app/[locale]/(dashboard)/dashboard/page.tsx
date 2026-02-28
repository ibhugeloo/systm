export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Zap, Send, ClipboardList } from 'lucide-react';
import KanbanBoard from '@/components/dashboard/kanban-board';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const dict = await getDictionary();

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

  const stats = [
    {
      label: dict.dashboard.active_clients,
      value: activeClients,
      sub: `sur ${totalClients} au total`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: dict.dashboard.mvp_generated,
      value: mvpCount,
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: dict.dashboard.handoff_sent,
      value: handoffCount,
      icon: Send,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: dict.dashboard.pending_requests,
      value: pendingRequests || 0,
      icon: ClipboardList,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{dict.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">{dict.dashboard.pipeline}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                {stat.sub && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Kanban */}
      <KanbanBoard clients={allClients} locale={locale} />
    </div>
  );
}
