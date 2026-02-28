'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';

interface Dictionary {
  onboarding: Record<string, string>;
  common: Record<string, string>;
}

interface PaymentStepProps {
  dictionary: Dictionary;
}

export function PaymentStep({ dictionary }: PaymentStepProps): React.ReactElement {
  const dict = dictionary.onboarding;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{dict.payment_title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {dict.payment_coming_soon_desc}
            </p>
          </div>

          <Button disabled className="gap-2 w-full" size="lg">
            <Lock className="h-4 w-4" />
            {dict.payment_coming_soon}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
