export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface ClientsPageProps {
  params: Promise<{ locale: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  mvp_generated: 'MVP Généré',
  demo_scheduled: 'Démo Prévue',
  demo_done: 'Démo Terminée',
  handoff_sent: 'Handoff Envoyé',
  in_production: 'En Production',
  closed: 'Clôturé',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  onboarding: 'secondary',
  mvp_generated: 'default',
  demo_scheduled: 'outline',
  demo_done: 'outline',
  handoff_sent: 'default',
  in_production: 'default',
  closed: 'secondary',
};

export default async function ClientsPage({ params }: ClientsPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const dict = await getDictionary();

  // Fetch all clients with assigned team member
  const { data: clients } = await supabase
    .from('clients')
    .select('*, profiles!clients_assigned_to_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.clients}</h1>
          <p className="text-muted-foreground mt-1">
            {clients?.length || 0} client{(clients?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link href={`/fr/dashboard/clients/new/onboarding`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {(!clients || clients.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">Aucun client pour le moment</p>
              <Link href={`/fr/dashboard/clients/new/onboarding`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {clients.map((client) => {
              const assignedTo = (client as any).profiles?.full_name;
              return (
                <Link
                  key={client.id}
                  href={`/fr/dashboard/clients/${client.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold truncate">{client.company_name}</p>
                          <Badge variant={STATUS_VARIANT[client.status] || 'secondary'}>
                            {STATUS_LABELS[client.status] || client.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{client.sector}</span>
                          {client.contact_name && <span>{client.contact_name}</span>}
                          {assignedTo && <span>Assigné à {assignedTo}</span>}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">
                        {new Date(client.created_at).toLocaleDateString('fr')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
