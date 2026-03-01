'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectFigmaPromptProps {
  clientId: string;
  client: {
    company_name: string;
    sector: string;
    problem_description: string;
  };
  existingPrompt: string | null;
  mvpId: string | null;
}

export default function ProjectFigmaPrompt({
  clientId,
  client,
  existingPrompt,
  mvpId,
}: ProjectFigmaPromptProps) {
  const [companyName, setCompanyName] = useState(client.company_name || '');
  const [sector, setSector] = useState(client.sector || '');
  const [problemDescription, setProblemDescription] = useState(client.problem_description || '');
  const [features, setFeatures] = useState('');
  const [prompt, setPrompt] = useState(existingPrompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!companyName || !problemDescription) {
      toast.error('Le nom et le problème sont requis');
      return;
    }

    setIsGenerating(true);
    try {
      const fullDescription = features
        ? `${problemDescription}\n\nFonctionnalités souhaitées :\n${features}`
        : problemDescription;

      const res = await fetch('/api/ai/generate-figma-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          sector,
          problem_description: fullDescription,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await res.json();
      setPrompt(data.prompt);
      toast.success('Prompt généré avec succès');
    } catch {
      toast.error('Erreur lors de la génération du prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Prompt copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Prompt Figma Make
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l&apos;entreprise</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secteur</label>
              <Input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ex: Tech, Finance, Santé..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description du problème</label>
            <Textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Décrivez le problème que le client souhaite résoudre..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fonctionnalités souhaitées</label>
            <Textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Ex: Catalogue produits, panier d'achat, intégration Stripe, espace client..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !companyName || !problemDescription}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : prompt ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Regénérer le prompt
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Générer le prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {isGenerating && (
        <Card className="border-violet-200 dark:border-violet-800">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-violet-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Génération en cours...</p>
              <p className="text-sm text-muted-foreground mt-1">
                L&apos;IA analyse le projet et crée un prompt optimisé pour Figma Make
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Prompt */}
      {prompt && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Résultat
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                {prompt}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
