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

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  userId?: string;
  initialData?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export default function UserFormDialog({
  open,
  onOpenChange,
  mode,
  userId,
  initialData,
}: UserFormDialogProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('team_member');
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setFullName(initialData.full_name);
        setEmail(initialData.email);
        setRole(initialData.role);
        setPassword('');
      } else {
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('team_member');
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: fullName, email, password, role }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Erreur lors de la création');
          return;
        }
        toast.success('Utilisateur créé');
      } else {
        const body: Record<string, string> = { id: userId!, full_name: fullName, email, role };
        if (password) body.password = password;

        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Erreur lors de la modification');
          return;
        }
        toast.success('Utilisateur modifié');
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
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
        return;
      }
      toast.success('Utilisateur supprimé');
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
              {mode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nom complet
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="userEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="userEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="userPassword" className="text-sm font-medium">
                {mode === 'edit' ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
              </label>
              <Input
                id="userPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'edit' ? '••••••••' : 'Mot de passe'}
                required={mode === 'create'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="team_member">Membre de l&apos;équipe</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
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
                {mode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;utilisateur sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
