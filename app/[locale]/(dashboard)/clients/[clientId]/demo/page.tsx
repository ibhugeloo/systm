"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import MvpPreview from "@/components/mvp/mvp-preview";
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

  useEffect(() => {
    const fetchMvp = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("mvps")
          .select("canvas_data")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        setMvp(data);

        // Track demo started event
        posthog?.capture("demo_started", {
          client_id: clientId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to fetch MVP:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMvp();
  }, [clientId, posthog]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading MVP...</p>
        </div>
      </div>
    );
  }

  if (!mvp) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">No MVP Found</h1>
        <p className="text-gray-600">This client doesn't have an MVP yet.</p>
        <Link href={`/${locale}/dashboard/clients/${clientId}`}>
          <Button variant="outline">Back to Client</Button>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-40">
        <Link href={`/${locale}/dashboard/clients/${clientId}`}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            End Demo
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {showChat ? "Hide" : "Show"} Chat
        </Button>
      </div>

      {/* Chat Panel (optional) */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-16 w-80 bg-white border-l border-gray-200 p-4 overflow-auto z-30">
          <h3 className="font-semibold mb-4">Conversation</h3>
          <div className="text-sm text-gray-600 text-center py-8">
            Chat integration coming soon
          </div>
        </div>
      )}
    </div>
  );
}
