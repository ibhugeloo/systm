'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createClient } from '@/lib/supabase/client';

interface MvpLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  mvpId?: string;
  clients: Array<{ id: string; company_name: string }>;
  initialData?: {
    client_id: string;
    figma_url: string;
  };
}

export default function MvpLinkDialog({
  open,
  onOpenChange,
  mode,
  mvpId,
  clients,
  initialData,
}: MvpLinkDialogProps) {
  const [clientId, setClientId] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setClientId(initialData.client_id);
        setFigmaUrl(initialData.figma_url);
      } else {
        setClientId('');
        setFigmaUrl('');
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === 'create') {
        if (!clientId) {
          toast.error('Sélectionnez un client');
          return;
        }

        const { error } = await supabase.from('mvps').insert({
          client_id: clientId,
          figma_url: figmaUrl || null,
          status: 'draft',
          version: 1,
          canvas_data: null,
          generated_prompt: null,
        });

        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('MVP ajouté');
      } else {
        const { error } = await supabase
          .from('mvps')
          .update({ figma_url: figmaUrl || null })
          .eq('id', mvpId!);

        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success('MVP modifié');
      }

      onOpenChange(false);
      window.location.reload();
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('mvps').delete().eq('id', mvpId!);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('MVP supprimé');
      setDeleteOpen(false);
      onOpenChange(false);
      window.location.reload();
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Ajouter un MVP' : 'Modifier le MVP'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={clientId}
                onValueChange={setClientId}
                disabled={mode === 'edit'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="figmaUrl" className="text-sm font-medium">
                URL Figma
              </label>
              <Input
                id="figmaUrl"
                type="url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/design/..."
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="mr-auto gap-1.5"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </Button>
              )}
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'create' ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce MVP ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
