'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Building2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface NewProjectFormProps {
  locale: string;
  clients: Array<{ id: string; company_name: string; sector?: string }>;
}

type StepNumber = 1 | 2;

const SECTOR_OPTIONS = [
  { value: 'tech', label: 'Technologie' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'retail', label: 'Commerce' },
  { value: 'logistics', label: 'Logistique' },
  { value: 'media', label: 'Média' },
  { value: 'other', label: 'Autre' },
];

const STEPS = [
  { number: 1, label: 'Brief', icon: Building2 },
  { number: 2, label: 'Prompt Figma', icon: Sparkles },
];

export default function NewProjectForm({ locale, clients }: NewProjectFormProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [clientId, setClientId] = useState('');
  const [sector, setSector] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedClient = clients.find((c) => c.id === clientId);
  const companyName = selectedClient?.company_name || '';

  const handleClientChange = useCallback((id: string) => {
    const client = clients.find((c) => c.id === id);
    setClientId(id);
    if (client?.sector) {
      setSector(client.sector);
    }
    setErrors({});
  }, [clients]);

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.client_id = 'Veuillez sélectionner un client';
    if (!sector) newErrors.sector = 'Le secteur est requis';
    if (!problemDescription || problemDescription.length < 20) {
      newErrors.problem_description = 'Décrivez le problème (minimum 20 caractères)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      // Auto-generate on step 2
      handleGenerate();
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStep(2);
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

      if (!res.ok) throw new Error('Erreur');

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

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const problemDescLength = problemDescription.length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-6 left-[calc(20%)] right-[calc(20%)] h-0.5 bg-border" />
        <div
          className="absolute top-6 left-[calc(20%)] h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent * 0.6}%` }}
        />

        <div className="relative flex justify-center gap-32">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            const isClickable = step.number < currentStep;

            return (
              <button
                key={step.number}
                onClick={() => {
                  if (isClickable) setCurrentStep(step.number as StepNumber);
                }}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 group',
                  isClickable && 'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isActive && 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110',
                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                    !isActive && !isCompleted && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs font-semibold transition-colors text-center',
                    isActive && 'text-foreground',
                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold tracking-tight">
          {currentStep === 1 ? 'Décrivez le projet' : 'Prompt Figma Make'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {currentStep === 1
            ? 'Sélectionnez le client et décrivez le problème à résoudre'
            : 'Copiez le prompt et collez-le dans Figma Make'}
        </p>
      </div>

      {/* Step 1 — Brief */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Client Select */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Client
              <span className="text-destructive ml-1">*</span>
            </label>
            <Select value={clientId} onValueChange={handleClientChange}>
              <SelectTrigger
                className={cn(
                  'h-11',
                  errors.client_id && 'border-destructive focus-visible:ring-destructive'
                )}
              >
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
            {errors.client_id && (
              <p className="text-sm text-destructive">{errors.client_id}</p>
            )}
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Secteur d&apos;activité
              <span className="text-destructive ml-1">*</span>
            </label>
            <Select value={sector} onValueChange={(v) => { setSector(v); setErrors({}); }}>
              <SelectTrigger
                className={cn(
                  'h-11',
                  errors.sector && 'border-destructive focus-visible:ring-destructive'
                )}
              >
                <SelectValue placeholder="Sélectionner un secteur" />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sector && (
              <p className="text-sm text-destructive">{errors.sector}</p>
            )}
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="block text-sm font-medium">
                Décrivez le problème
                <span className="text-destructive ml-1">*</span>
              </label>
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  problemDescLength >= 20
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                )}
              >
                {problemDescLength}/20
              </span>
            </div>
            <Textarea
              placeholder="Décrivez le problème que le client souhaite résoudre..."
              value={problemDescription}
              onChange={(e) => { setProblemDescription(e.target.value); setErrors({}); }}
              className={cn(
                'min-h-[120px] resize-none',
                errors.problem_description && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            {errors.problem_description && (
              <p className="text-sm text-destructive">{errors.problem_description}</p>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Fonctionnalités souhaitées
            </label>
            <Textarea
              placeholder="Ex: Catalogue produits, panier d'achat, intégration Stripe, espace client..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2 — Prompt */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Loading */}
          {isGenerating && (
            <Card className="border-violet-200 dark:border-violet-800">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="h-14 w-14 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-violet-600 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Génération en cours...</p>
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
                    Prompt Figma Make
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

          {/* Regenerate */}
          {prompt && !isGenerating && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4" />
                Regénérer le prompt
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-2">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex-1 h-12 gap-2 text-base"
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        {currentStep === 1 && (
          <Button
            onClick={handleNext}
            className="flex-1 h-12 gap-2 text-base"
          >
            Générer le prompt
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
