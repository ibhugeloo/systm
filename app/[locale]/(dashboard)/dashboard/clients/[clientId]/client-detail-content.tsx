'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import {
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  Hash,
  Pencil,
  Monitor,
  Globe,
  Clock,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, ClientRequest } from '@/types/database';
import ClientFormDialog from '@/components/clients/client-form-dialog';
import ConversationPanel from '@/components/conversation/conversation-panel';
import { useAuth } from '@/lib/hooks/use-auth';

interface ClientDetailContentProps {
  locale: string;
  client: Client;
  conversationId: string | null;
  loginLogs: Array<{
    id: string;
    logged_in_at: string;
    ip_address: string;
    user_agent: string;
  }>;
  requests: ClientRequest[];
}

const REQUEST_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200' },
  in_review: { label: 'En cours', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
  done: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' },
  rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' },
};

const TYPE_LABELS: Record<string, string> = {
  feature: 'Fonctionnalité',
  bug: 'Bug',
  meeting: 'Réunion',
  question: 'Question',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function parseBrowser(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Navigateur inconnu';
}

export default function ClientDetailContent({
  locale,
  client,
  conversationId,
  loginLogs,
  requests,
}: ClientDetailContentProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { profile } = useAuth();

  const onboarding = client.onboarding_data as Record<string, unknown> | null;
  const siret = (onboarding?.siret as string) || '';
  const address = (onboarding?.address as string) || '';
  const phone = (onboarding?.phone as string) || '';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}/dashboard`}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/${locale}/dashboard/clients`}>Clients</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{client.company_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary text-white">
              {getInitials(client.company_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.company_name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {client.contact_name && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {client.contact_name}
                </span>
              )}
              {client.sector && (
                <Badge variant="secondary" className="text-xs">
                  {client.sector}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditDialogOpen(true)}>
          <Pencil className="h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="requests">
            Requêtes
            {requests.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] h-5 min-w-5 px-1">
                {requests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Informations */}
        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.contact_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{client.contact_email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{address}</span>
                  </div>
                )}
                {siret && (
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>SIRET : {siret}</span>
                  </div>
                )}
                {!client.contact_email && !phone && !address && !siret && (
                  <p className="text-sm text-muted-foreground">Aucune coordonnée renseignée</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{client.company_name}</span>
                </div>
                {client.sector && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Secteur : {client.sector}</span>
                  </div>
                )}
                {client.problem_description && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Problème</p>
                    <p className="text-sm">{client.problem_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Support */}
        <TabsContent value="support" className="mt-6">
          {conversationId ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0 h-[500px] relative">
                <ConversationPanel
                  clientId={client.id}
                  conversationId={conversationId}
                  isOpen={true}
                  onClose={() => setChatOpen(false)}
                  senderRole={profile?.role as 'admin' | 'team_member' | undefined}
                  senderId={profile?.id}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">Aucune conversation pour ce client</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Historique */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Historique de connexion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loginLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune connexion enregistrée
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Adresse IP</th>
                        <th className="pb-3 font-medium">Navigateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginLogs.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="py-3 text-sm">{formatDate(log.logged_in_at)}</td>
                          <td className="py-3 text-sm font-mono text-muted-foreground">
                            {log.ip_address}
                          </td>
                          <td className="py-3 text-sm text-muted-foreground flex items-center gap-2">
                            <Monitor className="h-3.5 w-3.5" />
                            {parseBrowser(log.user_agent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Requêtes */}
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">Aucune requête</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="p-4 font-medium">Titre</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Priorité</th>
                        <th className="p-4 font-medium">Statut</th>
                        <th className="p-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => {
                        const status = REQUEST_STATUS[req.status] || REQUEST_STATUS.pending;
                        return (
                          <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                            <td className="p-4 text-sm font-medium">{req.title}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {TYPE_LABELS[req.type] || req.type}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs capitalize">
                                {req.priority}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={`text-xs ${status.className}`}>
                                {status.label}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(req.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ClientFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        clientId={client.id}
        initialData={{
          company_name: client.company_name || '',
          contact_name: client.contact_name || '',
          contact_email: client.contact_email || '',
          sector: client.sector || '',
          phone,
          siret,
          address,
        }}
        onboardingData={client.onboarding_data as Record<string, unknown> | null}
      />
    </div>
  );
}
