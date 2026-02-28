import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ConversationPanel from "@/components/conversation/conversation-panel"
import ExportMarkdown from "@/components/conversation/export-markdown"
import ContextSummary from "@/components/conversation/context-summary"

interface ConversationPageProps {
  params: Promise<{
    locale: string
    clientId: string
  }>
}

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { locale, clientId } = await params
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

  // Fetch or create conversation
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id, messages")
    .eq("client_id", clientId)
    .single()

  let conversationId = conversation?.id

  if (conversationError || !conversation) {
    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({
        client_id: clientId,
        messages: [],
      })
      .select("id")
      .single()

    if (createError || !newConversation) {
      notFound()
    }

    conversationId = newConversation.id
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Discussion - {client.company_name}</h1>
        <ExportMarkdown clientId={clientId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContextSummary
            clientId={clientId}
            conversationId={conversationId!}
          />
        </div>

        <div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="font-semibold mb-2">Statistiques</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Messages totaux: {conversation?.messages?.length || 0}</p>
              <p>Dernière mise à jour: {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
