'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const STATUS_PROGRESS: Record<string, number> = {
  onboarding: 10,
  mvp_generated: 30,
  demo_scheduled: 45,
  demo_done: 60,
  handoff_sent: 80,
  in_production: 90,
  closed: 100,
};

const STATUS_LABELS: Record<string, string> = {
  onboarding: 'Onboarding en cours',
  mvp_generated: 'MVP généré',
  demo_scheduled: 'Démo planifiée',
  demo_done: 'Démo terminée',
  handoff_sent: 'Spécifications envoyées',
  in_production: 'En production',
  closed: 'Projet terminé',
};

export default function PortalPage() {
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();

  const [client, setClient] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();
      // Find client by user email
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('contact_email', user.email)
        .single();

      if (clientData) {
        setClient(clientData);

        // Fetch requests
        const { data: requestsData } = await supabase
          .from('client_requests')
          .select('*')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRequests(requestsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h1 className="text-2xl font-bold mb-2">Bienvenue sur systm.re</h1>
        <p className="text-muted-foreground">
          Aucun projet trouvé pour votre compte. Contactez notre équipe.
        </p>
      </div>
    );
  }

  const progress = STATUS_PROGRESS[client.status] || 0;

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Bonjour, {client.contact_name || client.company_name}</h1>
        <p className="text-muted-foreground mt-1">Voici l&apos;état de votre projet</p>
      </div>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Statut du projet</CardTitle>
            <Badge>{STATUS_LABELS[client.status] || client.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">{progress}% complété</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/fr/portal/requests`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <p className="font-medium">Soumettre une requête</p>
              <p className="text-xs text-muted-foreground text-center">
                Demander une fonctionnalité ou signaler un bug
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/fr/portal/booking`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              <p className="font-medium">Prendre rendez-vous</p>
              <p className="text-xs text-muted-foreground text-center">
                Planifier un appel avec notre équipe
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Support</p>
            <p className="text-xs text-muted-foreground text-center">
              {client.contact_email || 'contact@systm.re'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vos dernières requêtes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{req.title}</p>
                    <p className="text-xs text-muted-foreground">{req.type}</p>
                  </div>
                  <Badge variant={req.status === 'done' ? 'default' : 'secondary'}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
