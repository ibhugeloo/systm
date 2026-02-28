"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import MvpPreview from "@/components/mvp/mvp-preview";
import ConversationPanel from "@/components/conversation/conversation-panel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";
import { MvpCanvas } from "@/types/mvp";
import { usePostHog } from "posthog-js/react";

export default function DemoPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const locale = params.locale as string;
  const posthog = usePostHog();

  const [mvp, setMvp] = useState<{ canvas_data: MvpCanvas } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      try {
        // Fetch MVP
        const { data: mvpData, error: mvpError } = await supabase
          .from("mvps")
          .select("canvas_data")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (mvpError) throw mvpError;
        setMvp(mvpData);

        // Fetch or create conversation
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .eq("client_id", clientId)
          .single();

        if (convError || !conversation) {
          const { data: newConversation } = await supabase
            .from("conversations")
            .insert({ client_id: clientId, messages: [] })
            .select("id")
            .single();

          if (newConversation) {
            setConversationId(newConversation.id);
          }
        } else {
          setConversationId(conversation.id);
        }

        // Track demo started event
        posthog?.capture("demo_started", {
          client_id: clientId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId, posthog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement du MVP...</p>
        </div>
      </div>
    );
  }

  if (!mvp) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Aucun MVP trouvé</h1>
        <p className="text-gray-600 dark:text-gray-400">Ce client n&apos;a pas encore de MVP.</p>
        <Link href={`/${locale}/dashboard/clients/${clientId}`}>
          <Button variant="outline">Retour au client</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Preview */}
      <MvpPreview
        canvas={mvp.canvas_data}
        onExit={() => {
          window.history.back();
        }}
      />

      {/* Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-40">
        <Link href={`/${locale}/dashboard/clients/${clientId}`}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Fin de démo
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {showChat ? "Masquer" : "Afficher"} le chat
        </Button>
      </div>

      {/* Chat Panel */}
      {conversationId && (
        <ConversationPanel
          clientId={clientId}
          conversationId={conversationId}
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
