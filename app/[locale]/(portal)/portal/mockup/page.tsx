'use client';

import { usePortalClient } from '@/providers/portal-client-provider';
import MvpCanvasComponent from '@/components/mvp/mvp-canvas';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Layout, Sparkles } from 'lucide-react';

export default function PortalMockupPage() {
  const { mvpCanvas, isLoading, client } = usePortalClient();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Layout className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Maquette indisponible</h1>
        <p className="text-muted-foreground max-w-md">
          Aucun projet trouvé pour votre compte.
        </p>
      </div>
    );
  }

  if (!mvpCanvas) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maquette du projet</h1>
          <p className="text-muted-foreground mt-1">
            Voici la maquette interactive de votre projet
          </p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune maquette disponible</h2>
          <p className="text-muted-foreground max-w-md">
            Votre maquette sera disponible une fois le MVP généré par notre équipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maquette du projet</h1>
        <p className="text-muted-foreground mt-1">
          Voici la maquette interactive de votre projet
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <MvpCanvasComponent
            canvas={mvpCanvas}
            selectedBlockId={null}
            onSelectBlock={() => {}}
            onUpdateBlock={() => {}}
            isEditing={false}
            mvpId=""
          />
        </CardContent>
      </Card>
    </div>
  );
}
