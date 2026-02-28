"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface HandoffActionsProps {
  handoffId: string
  status: string
  contactEmail?: string
}

export default function HandoffActions({
  handoffId,
  status,
  contactEmail,
}: HandoffActionsProps) {
  const [isSending, setIsSending] = useState(false)
  const [email, setEmail] = useState(contactEmail || "")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const getStatusBadgeVariant = (
    s: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (s) {
      case "draft":
        return "secondary"
      case "sent":
        return "outline"
      case "acknowledged":
        return "default"
      default:
        return "outline"
    }
  }

  const getStatusLabel = (s: string): string => {
    switch (s) {
      case "draft":
        return "Brouillon"
      case "sent":
        return "Envoyé"
      case "acknowledged":
        return "Reconnu"
      default:
        return s
    }
  }

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error("Veuillez saisir une adresse email")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/email/send-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handoffId,
          recipients: [email.trim()],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de l'envoi")
      }

      toast.success("Handoff envoyé par email")
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Send handoff email error:", error)
      toast.error("Échec de l'envoi de l'email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusBadgeVariant(status)}>
        {getStatusLabel(status)}
      </Badge>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Envoyer par email
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer le handoff</DialogTitle>
            <DialogDescription>
              Saisissez l&apos;adresse email du destinataire pour envoyer le
              document de handoff.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendEmail()
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
