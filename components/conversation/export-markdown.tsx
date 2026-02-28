"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExportMarkdownProps {
  clientId: string
}

export default function ExportMarkdown({ clientId }: ExportMarkdownProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/generate-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })

      if (!response.ok) throw new Error("Failed to generate handoff")

      const { handoffId } = await response.json()

      router.push(`/clients/${clientId}/handoff?handoffId=${handoffId}`)
    } catch (error) {
      console.error("Failed to export:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      variant="default"
      size="sm"
    >
      <FileDown className="h-4 w-4 mr-2" />
      {isLoading ? "Génération..." : "Exporter en Markdown"}
    </Button>
  )
}
