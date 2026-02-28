import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import HandoffEditor from "@/components/handoff/handoff-editor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"

interface HandoffPageProps {
  params: Promise<{
    locale: string
    clientId: string
  }>
  searchParams: Promise<{
    handoffId?: string
  }>
}

export default async function HandoffPage({
  params,
  searchParams,
}: HandoffPageProps) {
  const { locale, clientId } = await params
  const { handoffId } = await searchParams
  const supabase = await createClient()

  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, company_name")
    .eq("id", clientId)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch or create handoff
  let handoff: { id: string; markdown_content: string; status: string } | null = null

  if (handoffId) {
    const { data: existingHandoff } = await supabase
      .from("handoffs")
      .select("id, markdown_content, status")
      .eq("id", handoffId)
      .eq("client_id", clientId)
      .single()

    handoff = existingHandoff
  } else {
    const { data: existingHandoff } = await supabase
      .from("handoffs")
      .select("id, markdown_content, status")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    handoff = existingHandoff
  }

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Brouillon"
      case "sent":
        return "Envoyé"
      case "acknowledged":
        return "Reconnu"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Handoff - {client.company_name}</h1>
        <div className="flex items-center gap-2">
          {handoff && (
            <Badge variant={getStatusBadgeVariant(handoff.status)}>
              {getStatusLabel(handoff.status)}
            </Badge>
          )}
          {handoff && (
            <Button variant="default" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Envoyer par email
            </Button>
          )}
        </div>
      </div>

      {!handoff ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun handoff</h2>
          <p className="text-gray-600 mb-6">
            Générez un handoff à partir de la discussion client
          </p>
          <form action={`/api/ai/generate-handoff`} method="POST">
            <input type="hidden" name="clientId" value={clientId} />
            <Button type="submit">Générer le handoff</Button>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <HandoffEditor
            handoffId={handoff.id}
            initialContent={handoff.markdown_content || ""}
            clientId={clientId}
          />
        </div>
      )}
    </div>
  )
}
