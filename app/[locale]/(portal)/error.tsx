'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center py-12 gap-4">
          <div className="h-14 w-14 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold">Une erreur est survenue</h2>
          <p className="text-muted-foreground text-sm">
            Quelque chose s&apos;est mal passé. Veuillez réessayer.
          </p>
          <Button onClick={reset} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
