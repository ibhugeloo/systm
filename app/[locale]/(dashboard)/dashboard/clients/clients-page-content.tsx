'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Building2, Mail, Hash, MapPin, Pencil, FolderKanban } from 'lucide-react';
import { Client } from '@/types/database';
import ClientFormDialog from '@/components/clients/client-form-dialog';

interface ClientsPageContentProps {
  clients: Client[];
  locale: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClientsPageContent({ clients, locale }: ClientsPageContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCreate = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const count = clients.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {count} client{count > 1 ? 's' : ''} enregistré{count > 1 ? 's' : ''}
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Créer un Client
        </Button>
      </div>

      {/* Client Grid */}
      {clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun client pour le moment</p>
            <Button className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Créer un Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client) => {
            const onboarding = client.onboarding_data as Record<string, unknown> | null;
            const siret = (onboarding?.siret as string) || '';
            const address = (onboarding?.address as string) || '';

            return (
              <Card key={client.id} className="group hover:shadow-md hover:border-primary/20 transition-all duration-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {getInitials(client.company_name)}
                      </div>
                      <div>
                        <p className="font-semibold">{client.company_name}</p>
                        {client.contact_name && (
                          <p className="text-sm text-muted-foreground">{client.contact_name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEdit(client)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    {client.contact_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{client.contact_email}</span>
                      </div>
                    )}
                    {siret && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{siret}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FolderKanban className="h-3.5 w-3.5" />
                      <span>1 projet actif</span>
                    </div>
                    {client.sector && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {client.sector}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingClient ? 'edit' : 'create'}
        clientId={editingClient?.id}
        initialData={
          editingClient
            ? {
                company_name: editingClient.company_name || '',
                contact_name: editingClient.contact_name || '',
                contact_email: editingClient.contact_email || '',
                sector: editingClient.sector || '',
                phone: ((editingClient.onboarding_data as Record<string, unknown> | null)?.phone as string) || '',
                siret: ((editingClient.onboarding_data as Record<string, unknown> | null)?.siret as string) || '',
                address: ((editingClient.onboarding_data as Record<string, unknown> | null)?.address as string) || '',
              }
            : undefined
        }
        onboardingData={editingClient?.onboarding_data as Record<string, unknown> | null}
      />
    </div>
  );
}
