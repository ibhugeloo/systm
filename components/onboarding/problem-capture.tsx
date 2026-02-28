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

const SECTOR_KEYS = [
  { value: 'tech', key: 'sector_tech' },
  { value: 'finance', key: 'sector_finance' },
  { value: 'healthcare', key: 'sector_healthcare' },
  { value: 'education', key: 'sector_education' },
  { value: 'retail', key: 'sector_retail' },
  { value: 'logistics', key: 'sector_logistics' },
  { value: 'media', key: 'sector_media' },
  { value: 'other', key: 'sector_other' },
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

  const getFieldError = (field: string): string | undefined => {
    const fieldErrors = errors[field];
    return fieldErrors?.[0];
  };

  const problemDescLength = (data.problem_description || '').length;
  const minLength = 50;

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div className="space-y-2">
        <label htmlFor="company_name" className="block text-sm font-medium">
          {dict.company_name_label}
          <span className="text-destructive ml-1">*</span>
        </label>
        <Input
          id="company_name"
          placeholder={dict.company_name_placeholder}
          value={data.company_name || ''}
          onChange={handleCompanyNameChange}
          className={cn(
            'h-11',
            getFieldError('company_name') && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        {getFieldError('company_name') && (
          <p className="text-sm text-destructive">{getFieldError('company_name')}</p>
        )}
      </div>

      {/* Sector */}
      <div className="space-y-2">
        <label htmlFor="sector" className="block text-sm font-medium">
          {dict.sector_label}
          <span className="text-destructive ml-1">*</span>
        </label>
        <Select value={data.sector || ''} onValueChange={handleSectorChange}>
          <SelectTrigger
            id="sector"
            className={cn(
              'h-11',
              getFieldError('sector') && 'border-destructive focus-visible:ring-destructive'
            )}
          >
            <SelectValue placeholder={dict.sector_placeholder} />
          </SelectTrigger>
          <SelectContent>
            {SECTOR_KEYS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {dict[option.key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError('sector') && (
          <p className="text-sm text-destructive">{getFieldError('sector')}</p>
        )}
      </div>

      {/* Problem Description */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <label htmlFor="problem_description" className="block text-sm font-medium">
            {dict.problem_description_label}
            <span className="text-destructive ml-1">*</span>
          </label>
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              problemDescLength >= minLength
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            )}
          >
            {problemDescLength}/{minLength}
          </span>
        </div>
        <Textarea
          id="problem_description"
          placeholder={dict.problem_description_placeholder}
          value={data.problem_description || ''}
          onChange={handleProblemDescriptionChange}
          className={cn(
            'min-h-[120px] resize-none',
            getFieldError('problem_description') && 'border-destructive focus-visible:ring-destructive'
          )}
          minLength={50}
        />
        {getFieldError('problem_description') && (
          <p className="text-sm text-destructive">{getFieldError('problem_description')}</p>
        )}
      </div>

    </div>
  );
}
