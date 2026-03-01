export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Zap, Send, ClipboardList } from 'lucide-react';
import KanbanBoard from '@/components/dashboard/kanban-board';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants/pipeline';
import type { Client } from '@/types/database';

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

  const STATUS_PROGRESS: Record<string, number> = {
    onboarding: 10,
    mvp_generated: 25,
    demo_scheduled: 40,
    demo_done: 55,
    handoff_sent: 70,
    in_production: 85,
    closed: 100,
  };

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

      {/* Projets Récents */}
      <RecentProjectsTable
        clients={allClients}
        statusProgress={STATUS_PROGRESS}
        dict={dict}
      />
    </div>
  );
}

// --- Recent Projects Table ---

interface RecentProjectsTableProps {
  clients: Array<Pick<Client, 'id' | 'company_name' | 'status' | 'sector'>>;
  statusProgress: Record<string, number>;
  dict: { dashboard: Record<string, string> };
}

function RecentProjectsTable({ clients, statusProgress, dict }: RecentProjectsTableProps) {
  const recentProjects = clients.slice(0, 5).map((client) => ({
    id: client.id,
    title: `Projet ${client.company_name}`,
    description: client.sector || '',
    clientName: client.company_name,
    status: client.status,
    progress: statusProgress[client.status] || 0,
  }));

  if (recentProjects.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.dashboard.recent_projects}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  {dict.dashboard.col_project}
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  {dict.dashboard.col_client}
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  {dict.dashboard.col_status}
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
                  {dict.dashboard.col_progress}
                </th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-sm">{project.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{project.clientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`${STATUS_COLORS[project.status]} text-xs font-medium`}>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <Progress value={project.progress} className="w-20 h-2" />
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
