'use client';

import { usePortalClient } from '@/providers/portal-client-provider';
import PortalSupportChat from '@/components/portal/portal-support-chat';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

export default function PortalSupportPage() {
  const { clientId, conversationId, isLoading, client } = usePortalClient();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  if (!client || !clientId || !conversationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Support indisponible</h1>
        <p className="text-muted-foreground max-w-md">
          Aucun projet trouvé pour votre compte. Contactez-nous directement à contact@systm.re
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground mt-1">
          Discutez avec notre équipe en temps réel
        </p>
      </div>

      <div className="h-[calc(100vh-240px)]">
        <PortalSupportChat
          clientId={clientId}
          conversationId={conversationId}
        />
      </div>
    </div>
  );
}
