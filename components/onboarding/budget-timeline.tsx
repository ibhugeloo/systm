'use client';

import React, { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OnboardingStep3Data } from '@/types/onboarding';

interface Dictionary {
  onboarding: Record<string, string>;
}

interface BudgetTimelineProps {
  data: Partial<OnboardingStep3Data>;
  onChange: (data: Partial<OnboardingStep3Data>) => void;
  dictionary: Dictionary;
  errors?: Record<string, string[]>;
}

const BUDGET_OPTIONS = [
  { value: '<5k', label: 'Less than $5,000' },
  { value: '5k-15k', label: '$5,000 - $15,000' },
  { value: '15k-50k', label: '$15,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '>100k', label: 'More than $100,000' },
];

const TIMELINE_OPTIONS = [
  { value: '<1month', label: 'Less than 1 month' },
  { value: '1-3months', label: '1-3 months' },
  { value: '3-6months', label: '3-6 months' },
  { value: '>6months', label: 'More than 6 months' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function BudgetTimeline({
  data,
  onChange,
  dictionary,
  errors = {},
}: BudgetTimelineProps): React.ReactElement {
  const dict = dictionary.onboarding;

  const handleBudgetChange = useCallback(
    (value: string) => {
      onChange({ ...data, budget_range: value });
    },
    [data, onChange]
  );

  const handleTimelineChange = useCallback(
    (value: string) => {
      onChange({ ...data, desired_timeline: value });
    },
    [data, onChange]
  );

  const handlePriorityChange = useCallback(
    (value: 'low' | 'medium' | 'high' | 'critical') => {
      onChange({ ...data, priority: value });
    },
    [data, onChange]
  );

  const getFieldError = (field: string): string | undefined => {
    const fieldErrors = errors[field];
    return fieldErrors?.[0];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{dict.step_3}</CardTitle>
        <CardDescription>{dict.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Range */}
        <div className="space-y-2">
          <label htmlFor="budget_range" className="block text-sm font-medium">
            {dict.budget_range_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select value={data.budget_range || ''} onValueChange={handleBudgetChange}>
            <SelectTrigger
              id="budget_range"
              className={cn(getFieldError('budget_range') && 'border-red-500 focus-visible:ring-red-500')}
            >
              <SelectValue placeholder={dict.budget_range_placeholder} />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('budget_range') && (
            <p className="text-sm text-red-500">{getFieldError('budget_range')}</p>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <label htmlFor="desired_timeline" className="block text-sm font-medium">
            {dict.desired_timeline_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select value={data.desired_timeline || ''} onValueChange={handleTimelineChange}>
            <SelectTrigger
              id="desired_timeline"
              className={cn(getFieldError('desired_timeline') && 'border-red-500 focus-visible:ring-red-500')}
            >
              <SelectValue placeholder={dict.desired_timeline_placeholder} />
            </SelectTrigger>
            <SelectContent>
              {TIMELINE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('desired_timeline') && (
            <p className="text-sm text-red-500">{getFieldError('desired_timeline')}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label htmlFor="priority" className="block text-sm font-medium">
            {dict.priority_label}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Select
            value={data.priority || ''}
            onValueChange={(value) => handlePriorityChange(value as 'low' | 'medium' | 'high' | 'critical')}
          >
            <SelectTrigger
              id="priority"
              className={cn(getFieldError('priority') && 'border-red-500 focus-visible:ring-red-500')}
            >
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('priority') && (
            <p className="text-sm text-red-500">{getFieldError('priority')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
