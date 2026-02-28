import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import HandoffEditor from "@/components/handoff/handoff-editor"
import HandoffActions from "@/components/handoff/handoff-actions"
import GenerateHandoffButton from "@/components/handoff/generate-handoff-button"

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
    .select("id, company_name, contact_email")
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Handoff - {client.company_name}</h1>
        {handoff && (
          <HandoffActions
            handoffId={handoff.id}
            status={handoff.status}
            contactEmail={client.contact_email}
          />
        )}
      </div>

      {!handoff ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Aucun handoff</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Générez un handoff à partir de la discussion client
          </p>
          <GenerateHandoffButton clientId={clientId} />
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
