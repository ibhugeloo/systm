'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface RequestFormProps {
  clientId: string;
  onSubmitted?: () => void;
}

export default function RequestForm({ clientId, onSubmitted }: RequestFormProps) {
  const supabase = createClient();
  const [type, setType] = useState<string>('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('client_requests').insert({
        client_id: clientId,
        type: type as 'feature' | 'bug' | 'meeting' | 'question',
        title: title.trim(),
        description: description.trim(),
        priority: priority as 'low' | 'medium' | 'high',
        status: 'pending' as const,
      });

      if (error) throw error;

      setTitle('');
      setDescription('');
      setType('feature');
      setPriority('medium');
      toast.success('Requête soumise avec succès');
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Envoi...' : 'Soumettre'}
      </Button>
    </form>
  );
}
