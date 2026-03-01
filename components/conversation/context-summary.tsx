"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

interface ContextSummaryProps {
  clientId: string
  conversationId: string
}

export default function ContextSummary({
  clientId,
  conversationId,
}: ContextSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSummary()
  }, [conversationId])

  const fetchSummary = async () => {
    try {
      const { data } = await supabase
        .from("conversations")
        .select("context_summary")
        .eq("id", conversationId)
        .single()

      if (data?.context_summary) {
        setSummary(data.context_summary)
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  const regenerateSummary = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/summarize-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, clientId }),
      })

      if (!response.ok) throw new Error("Failed to regenerate summary")

      const { summary: newSummary } = await response.json()
      setSummary(newSummary)
      setLastUpdated(new Date().toISOString())

      await supabase
        .from("conversations")
        .update({
          context_summary: newSummary,
        })
        .eq("id", conversationId)
    } catch (error) {
      console.error("Failed to regenerate summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-3 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
            Résumé du contexte
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {summary && (
              <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                {summary}
              </div>
            )}

            {lastUpdated && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Mis à jour:{" "}
                {new Date(lastUpdated).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={regenerateSummary}
              disabled={isLoading}
              className="w-full text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {isLoading ? "Génération..." : "Régénérer"}
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
