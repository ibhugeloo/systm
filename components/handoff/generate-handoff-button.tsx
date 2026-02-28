"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

interface GenerateHandoffButtonProps {
  clientId: string
}

export default function GenerateHandoffButton({ clientId }: GenerateHandoffButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la génération")
      }

      toast.success("Handoff généré avec succès")
      router.refresh()
    } catch (error) {
      console.error("Generate handoff error:", error)
      toast.error("Échec de la génération du handoff")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Génération en cours...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Générer le handoff
        </>
      )}
    </Button>
  )
}
