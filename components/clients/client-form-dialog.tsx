'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SECTORS = [
  { value: 'tech', label: 'Tech' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'retail', label: 'Commerce' },
  { value: 'logistics', label: 'Logistique' },
  { value: 'media', label: 'Média' },
  { value: 'other', label: 'Autre' },
];

interface ClientFormData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  sector: string;
  phone: string;
  siret: string;
  address: string;
}

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  clientId?: string;
  initialData?: ClientFormData;
  onboardingData?: Record<string, unknown> | null;
}

const EMPTY_FORM: ClientFormData = {
  company_name: '',
  contact_name: '',
  contact_email: '',
  sector: '',
  phone: '',
  siret: '',
  address: '',
};

export default function ClientFormDialog({
  open,
  onOpenChange,
  mode,
  clientId,
  initialData,
  onboardingData,
}: ClientFormDialogProps) {
  const [formData, setFormData] = useState<ClientFormData>(initialData || EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.company_name.trim()) {
      toast.error('Le nom de l\'entreprise est requis');
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'create') {
        const { error } = await supabase.from('clients').insert({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          sector: formData.sector,
          status: 'onboarding',
          problem_description: '',
          tech_stack: [],
          budget_range: '',
          timeline: '',
          assigned_to: '',
          onboarding_data: {
            phone: formData.phone,
            siret: formData.siret,
            address: formData.address,
          },
        });

        if (error) throw error;
        toast.success('Client créé avec succès');
      } else {
        // Merge new fields into existing onboarding_data
        const mergedOnboardingData = {
          ...(onboardingData || {}),
          phone: formData.phone,
          siret: formData.siret,
          address: formData.address,
        };

        const { error } = await supabase
          .from('clients')
          .update({
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            contact_email: formData.contact_email,
            sector: formData.sector,
            onboarding_data: mergedOnboardingData,
          })
          .eq('id', clientId!);

        if (error) throw error;
        toast.success('Client mis à jour');
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Échec de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clientId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      toast.success('Client supprimé');
      setShowDeleteConfirm(false);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Échec de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Créer un Client' : 'Modifier le client'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Entreprise *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Nom du contact</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => handleChange('contact_name', e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="contact@entreprise.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Secteur</Label>
                <Select value={formData.sector} onValueChange={(v) => handleChange('sector', v)}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => handleChange('siret', e.target.value)}
                  placeholder="123 456 789 00012"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="12 rue de la Paix, 75001 Paris"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {mode === 'edit' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : mode === 'create' ? (
                  'Créer'
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées (projets, MVP, conversations) seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
