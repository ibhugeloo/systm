'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';
import { Client, ClientRequest } from '@/types/database';

interface PortalClientContextType {
  client: Client | null;
  clientId: string | null;
  conversationId: string | null;
  isLoading: boolean;
  isProjectFinished: boolean;
  requests: ClientRequest[];
}

const PortalClientContext = createContext<PortalClientContextType | undefined>(undefined);

export function PortalClientProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchAll = async () => {
      const supabase = createClient();

      // 1. Fetch client by email
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('contact_email', user.email)
        .single();

      if (!clientData) {
        setIsLoading(false);
        return;
      }

      setClient(clientData);

      // 2. Fetch or create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', clientData.id)
        .single();

      if (convError || !conversation) {
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert({ client_id: clientData.id, messages: [] })
          .select('id')
          .single();

        if (newConversation) {
          setConversationId(newConversation.id);
        }
      } else {
        setConversationId(conversation.id);
      }

      // 3. Fetch recent requests
      const { data: requestsData } = await supabase
        .from('client_requests')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRequests((requestsData as ClientRequest[]) || []);

      setIsLoading(false);
    };

    fetchAll();
  }, [user, authLoading]);

  const isProjectFinished = client?.status === 'closed';

  return (
    <PortalClientContext.Provider
      value={{
        client,
        clientId: client?.id || null,
        conversationId,
        isLoading: isLoading || authLoading,
        isProjectFinished,
        requests,
      }}
    >
      {children}
    </PortalClientContext.Provider>
  );
}

export function usePortalClient() {
  const context = useContext(PortalClientContext);
  if (context === undefined) {
    throw new Error('usePortalClient must be used within a PortalClientProvider');
  }
  return context;
}
