export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Building2, Mail, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ClientsPageProps {
  params: Promise<{ locale: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  onboarding: { label: 'Onboarding', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  mvp_generated: { label: 'MVP Généré', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  demo_scheduled: { label: 'Démo Prévue', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  demo_done: { label: 'Démo Terminée', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  handoff_sent: { label: 'Handoff Envoyé', color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  in_production: { label: 'En Production', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  closed: { label: 'Clôturé', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const dict = await getDictionary(locale as 'fr');

  const { data: clients } = await supabase
    .from('clients')
    .select('*, profiles!clients_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false });

  const count = clients?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dict.dashboard.clients}</h1>
          <p className="text-muted-foreground mt-1">
            {count} client{count > 1 ? 's' : ''} enregistré{count > 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/clients/new/onboarding`}>
          <Button className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Client List */}
      {(!clients || clients.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun client pour le moment</p>
            <Link href={`/${locale}/dashboard/clients/new/onboarding`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un client
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((client) => {
            const assignedTo = (client as any).profiles?.full_name;
            const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG.onboarding;

            return (
              <Link
                key={client.id}
                href={`/${locale}/dashboard/clients/${client.id}`}
              >
                <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {getInitials(client.company_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold truncate">{client.company_name}</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {client.sector && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {client.sector}
                          </span>
                        )}
                        {client.contact_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {client.contact_name}
                          </span>
                        )}
                        {client.contact_email && (
                          <span className="hidden sm:flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.contact_email}
                          </span>
                        )}
                        {assignedTo && (
                          <span className="hidden md:inline text-xs bg-muted px-2 py-0.5 rounded-full">
                            {assignedTo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date + Arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:block">
                        {new Date(client.created_at).toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
