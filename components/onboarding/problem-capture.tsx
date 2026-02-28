'use client';

import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OnboardingStep1Data } from '@/types/onboarding';

interface Dictionary {
  onboarding: Record<string, string>;
}

interface ProblemCaptureProps {
  data: Partial<OnboardingStep1Data>;
  onChange: (data: Partial<OnboardingStep1Data>) => void;
  dictionary: Dictionary;
  errors?: Record<string, string[]>;
}

const SECTOR_OPTIONS = [
  { value: 'tech', label: 'Technologie' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Santé' },
  { value: 'education', label: 'Éducation' },
  { value: 'retail', label: 'Commerce' },
  { value: 'logistics', label: 'Logistique' },
  { value: 'media', label: 'Médias' },
  { value: 'other', label: 'Autre' },
];

export function ProblemCapture({
  data,
  onChange,
  dictionary,
  errors = {},
}: ProblemCaptureProps): React.ReactElement {
  const dict = dictionary.onboarding;

  const handleCompanyNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...data, company_name: e.target.value });
    },
    [data, onChange]
  );

  const handleSectorChange = useCallback(
    (value: string) => {
      onChange({ ...data, sector: value });
    },
    [data, onChange]
  );

  const handleProblemDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ ...data, problem_description: e.target.value });
    },
    [data, onChange]
  );

  const handleMainObjectiveChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...data, main_objective: e.target.value });
    },
    [data, onChange]
  );

  const getFieldError = (field: string): string | undefined => {
    const fieldErrors = errors[field];
    return fieldErrors?.[0];
  };

  const problemDescLength = (data.problem_description || '').length;
  const minLength = 50;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.step_1}</CardTitle>
        <CardDescription>{dict.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <label htmlFor="company_name" className="block text-sm font-medium">
            {dict.company_name_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="company_name"
            placeholder={dict.company_name_placeholder}
            value={data.company_name || ''}
            onChange={handleCompanyNameChange}
            className={cn(getFieldError('company_name') && 'border-red-500 focus-visible:ring-red-500')}
          />
          {getFieldError('company_name') && (
            <p className="text-sm text-red-500">{getFieldError('company_name')}</p>
          )}
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <label htmlFor="sector" className="block text-sm font-medium">
            {dict.sector_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select value={data.sector || ''} onValueChange={handleSectorChange}>
            <SelectTrigger
              id="sector"
              className={cn(getFieldError('sector') && 'border-red-500 focus-visible:ring-red-500')}
            >
              <SelectValue placeholder={dict.sector_placeholder} />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('sector') && (
            <p className="text-sm text-red-500">{getFieldError('sector')}</p>
          )}
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label htmlFor="problem_description" className="block text-sm font-medium">
              {dict.problem_description_label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <span className={cn('text-xs', problemDescLength < minLength ? 'text-amber-600' : 'text-muted-foreground')}>
              {problemDescLength}/{minLength}
            </span>
          </div>
          <Textarea
            id="problem_description"
            placeholder={dict.problem_description_placeholder}
            value={data.problem_description || ''}
            onChange={handleProblemDescriptionChange}
            className={cn(getFieldError('problem_description') && 'border-red-500 focus-visible:ring-red-500')}
            minLength={50}
          />
          {getFieldError('problem_description') && (
            <p className="text-sm text-red-500">{getFieldError('problem_description')}</p>
          )}
        </div>

        {/* Main Objective */}
        <div className="space-y-2">
          <label htmlFor="main_objective" className="block text-sm font-medium">
            {dict.main_objective_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Input
            id="main_objective"
            placeholder={dict.main_objective_placeholder}
            value={data.main_objective || ''}
            onChange={handleMainObjectiveChange}
            className={cn(getFieldError('main_objective') && 'border-red-500 focus-visible:ring-red-500')}
          />
          {getFieldError('main_objective') && (
            <p className="text-sm text-red-500">{getFieldError('main_objective')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
