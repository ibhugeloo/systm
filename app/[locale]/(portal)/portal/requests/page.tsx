'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

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

export default function PortalRequestsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';
  const { user } = useAuth();

  const [clientId, setClientId] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<string>('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('contact_email', user.email)
        .single();

      if (client) {
        setClientId(client.id);

        const { data: requestsData } = await supabase
          .from('client_requests')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });

        setRequests(requestsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !title.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('client_requests')
        .insert({
          client_id: clientId,
          type: type as 'feature' | 'bug' | 'meeting' | 'question',
          title: title.trim(),
          description: description.trim(),
          priority: priority as 'low' | 'medium' | 'high',
          status: 'pending' as const,
        })
        .select()
        .single();

      if (error) throw error;

      setRequests((prev) => [data, ...prev]);
      setTitle('');
      setDescription('');
      setType('feature');
      setPriority('medium');
      setShowForm(false);
      toast.success('Requête soumise avec succès');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes requêtes</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle requête
        </Button>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle requête</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Fonctionnalité</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="meeting">Réunion</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Titre</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Décrivez brièvement votre requête"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détaillez votre requête..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Envoi...' : 'Soumettre'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Request List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
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
                    </div>
                    {req.description && (
                      <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                    )}
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
