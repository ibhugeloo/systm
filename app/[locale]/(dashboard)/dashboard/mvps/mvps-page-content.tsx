'use client';

import { useState } from 'react';
import { Plus, ExternalLink, Sparkles, Copy, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MvpLinkDialog from '@/components/mvps/mvp-link-dialog';

interface MvpRow {
  id: string;
  client_id: string;
  generated_prompt: string | null;
  figma_url: string | null;
  status: string;
  created_at: string;
  clients: { company_name: string } | null;
}

interface MvpsPageContentProps {
  mvps: MvpRow[];
  clients: Array<{ id: string; company_name: string }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function MvpsPageContent({ mvps, clients }: MvpsPageContentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMvp, setEditingMvp] = useState<MvpRow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingMvp(null);
    setDialogOpen(true);
  };

  const handleEdit = (mvp: MvpRow) => {
    setEditingMvp(mvp);
    setDialogOpen(true);
  };

  const handleCopyUrl = async (mvp: MvpRow) => {
    if (!mvp.figma_url) return;
    await navigator.clipboard.writeText(mvp.figma_url);
    setCopiedId(mvp.id);
    toast.success('Lien copié');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MVP</h1>
          <p className="text-muted-foreground mt-1">
            Liens vers les maquettes Figma
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Ajouter un MVP
        </Button>
      </div>

      {/* MVP Grid */}
      {mvps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun MVP pour le moment</p>
            <Button className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un MVP
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mvps.map((mvp) => (
            <Card key={mvp.id} className="group hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">
                      {mvp.clients?.company_name || 'Client inconnu'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(mvp.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEdit(mvp)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {mvp.status}
                  </Badge>
                  {mvp.generated_prompt && (
                    <Badge variant="secondary" className="text-xs">
                      Prompt généré
                    </Badge>
                  )}
                </div>

                {mvp.figma_url ? (
                  <div className="flex gap-2">
                    <a
                      href={mvp.figma_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ouvrir dans Figma
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      onClick={() => handleCopyUrl(mvp)}
                    >
                      {copiedId === mvp.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Aucun lien Figma
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <MvpLinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingMvp ? 'edit' : 'create'}
        mvpId={editingMvp?.id}
        clients={clients}
        initialData={
          editingMvp
            ? {
                client_id: editingMvp.client_id,
                figma_url: editingMvp.figma_url || '',
              }
            : undefined
        }
      />
    </div>
  );
}
