'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MvpCanvas, MvpBlock } from '@/types/mvp';
import { AiEstimation } from '@/types/onboarding';
import MvpCanvasComponent from '@/components/mvp/mvp-canvas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Sparkles,
  Send,
  Trash2,
  Undo2,
  Redo2,
  Clock,
  Wallet,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MvpPreview from '@/components/mvp/mvp-preview';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface MvpStepProps {
  clientId: string | null;
  mvpId: string | null;
  canvas: MvpCanvas | null;
  estimation: AiEstimation | null;
  isGenerating: boolean;
  onCanvasUpdate: (canvas: MvpCanvas) => void;
  dictionary: Dictionary;
}

const BLOCK_TYPES: Array<{ value: MvpBlock['type']; label: string }> = [
  { value: 'hero', label: 'Héros' },
  { value: 'features', label: 'Fonctionnalités' },
  { value: 'pricing', label: 'Tarification' },
  { value: 'testimonials', label: 'Témoignages' },
  { value: 'cta', label: 'Appel à l\'action' },
  { value: 'dashboard', label: 'Tableau de bord' },
  { value: 'form', label: 'Formulaire' },
  { value: 'data-table', label: 'Tableau de données' },
  { value: 'stats', label: 'Statistiques' },
  { value: 'custom', label: 'Personnalisé' },
];

export function MvpStep({
  clientId,
  mvpId,
  canvas,
  estimation,
  isGenerating,
  onCanvasUpdate,
  dictionary,
}: MvpStepProps): React.ReactElement {
  const dict = dictionary.onboarding;

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [modification, setModification] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [history, setHistory] = useState<MvpCanvas[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showEstimation, setShowEstimation] = useState(true);
  const [mode, setMode] = useState<'edit' | 'present'>('edit');

  // Initialize history when canvas loads
  useEffect(() => {
    if (canvas && history.length === 0) {
      setHistory([canvas]);
      setHistoryIndex(0);
    }
  }, [canvas, history.length]);

  const pushHistory = useCallback(
    (newCanvas: MvpCanvas) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newCanvas);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const handleModify = useCallback(async () => {
    if (!modification.trim() || !canvas) return;

    setIsModifying(true);
    try {
      const response = await fetch('/api/ai/modify-mvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modification,
          currentCanvas: canvas,
        }),
      });

      if (!response.ok) throw new Error('Échec de la modification');

      const result = await response.json();
      if (result.canvas) {
        onCanvasUpdate(result.canvas);
        pushHistory(result.canvas);
      }
      setModification('');
    } catch (error) {
      console.error('Modification error:', error);
    } finally {
      setIsModifying(false);
    }
  }, [modification, canvas, onCanvasUpdate, pushHistory]);

  const handleAddBlock = useCallback(
    (type: MvpBlock['type']) => {
      if (!canvas) return;
      const maxRow = canvas.blocks.reduce((max, b) => Math.max(max, b.row + b.height), 0);
      const newBlock: MvpBlock = {
        id: `block-${Date.now()}`,
        type,
        row: maxRow + 1,
        col: 1,
        width: 12,
        height: 3,
        data: {},
      };
      const updated: MvpCanvas = {
        ...canvas,
        blocks: [...canvas.blocks, newBlock],
      };
      onCanvasUpdate(updated);
      pushHistory(updated);
    },
    [canvas, onCanvasUpdate, pushHistory]
  );

  const handleDeleteBlock = useCallback(() => {
    if (!selectedBlockId || !canvas) return;
    const updated: MvpCanvas = {
      ...canvas,
      blocks: canvas.blocks.filter((b) => b.id !== selectedBlockId),
    };
    onCanvasUpdate(updated);
    pushHistory(updated);
    setSelectedBlockId(null);
  }, [selectedBlockId, canvas, onCanvasUpdate, pushHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onCanvasUpdate(history[newIndex]);
    }
  }, [historyIndex, history, onCanvasUpdate]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onCanvasUpdate(history[newIndex]);
    }
  }, [historyIndex, history, onCanvasUpdate]);

  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<MvpBlock>) => {
      if (!canvas) return;
      const updated: MvpCanvas = {
        ...canvas,
        blocks: canvas.blocks.map((b) =>
          b.id === blockId ? { ...b, ...updates } : b
        ),
      };
      onCanvasUpdate(updated);
    },
    [canvas, onCanvasUpdate]
  );

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'text-emerald-600 bg-emerald-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return dict.estimation_complexity_low;
      case 'medium':
        return dict.estimation_complexity_medium;
      case 'high':
        return dict.estimation_complexity_high;
      default:
        return complexity;
    }
  };

  // --- Loading state ---
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{dict.generating_mvp}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {dict.generating_mvp_desc}
          </p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- No canvas yet ---
  if (!canvas) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          En attente de la génération...
        </p>
      </div>
    );
  }

  // --- Editor / Presentation mode ---
  const isPresenting = mode === 'present';

  if (isPresenting) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode('edit')}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Édition
          </Button>
        </div>
        <MvpPreview canvas={canvas} onExit={() => setMode('edit')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
        <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800">{dict.mvp_ready}</p>
          <p className="text-xs text-emerald-600">{dict.mvp_ready_desc}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border flex-wrap">
        {/* AI Modification input */}
        <div className="flex-1 min-w-48 flex gap-2">
          <Textarea
            placeholder="Décris ta modification..."
            value={modification}
            onChange={(e) => setModification(e.target.value)}
            disabled={isModifying}
            className="max-h-16 min-h-[40px] text-sm"
            rows={1}
          />
          <Button
            onClick={handleModify}
            disabled={isModifying || !modification.trim()}
            size="sm"
            className="px-3 self-end"
          >
            {isModifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Select onValueChange={(v) => handleAddBlock(v as MvpBlock['type'])}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Ajouter un bloc" />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_TYPES.map((bt) => (
                <SelectItem key={bt.value} value={bt.value}>
                  {bt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDeleteBlock}
            disabled={!selectedBlockId}
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Annuler"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Refaire"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setMode('edit')}
          >
            <Pencil className="h-3 w-3" />
            Édition
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setMode('present')}
          >
            <Eye className="h-3 w-3" />
            Présentation
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="rounded-xl border overflow-hidden bg-white">
        <MvpCanvasComponent
          canvas={canvas}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          isEditing={true}
          mvpId={mvpId || ''}
        />
      </div>

      {/* Estimation Panel */}
      {estimation && (
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer"
            onClick={() => setShowEstimation(!showEstimation)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold">{dict.estimation_title}</h3>
              </div>
              {showEstimation ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          {showEstimation && (
            <CardContent className="pt-0 space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{dict.estimation_duration}</p>
                  </div>
                  <p className="text-sm font-semibold">{estimation.duration}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{dict.estimation_budget}</p>
                  </div>
                  <p className="text-sm font-semibold">{estimation.budget}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{dict.estimation_complexity}</p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                      getComplexityColor(estimation.complexity)
                    )}
                  >
                    {getComplexityLabel(estimation.complexity)}
                  </span>
                </div>
              </div>

              {/* Breakdown table */}
              {estimation.breakdown && estimation.breakdown.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {dict.estimation_breakdown}
                  </p>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                            {dict.estimation_phase}
                          </th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                            {dict.estimation_phase_duration}
                          </th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                            {dict.estimation_phase_cost}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {estimation.breakdown.map((phase, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2 font-medium">{phase.phase}</td>
                            <td className="px-3 py-2 text-muted-foreground">{phase.duration}</td>
                            <td className="px-3 py-2 text-right font-medium">{phase.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
