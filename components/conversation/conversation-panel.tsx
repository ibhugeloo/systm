"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ConversationMessage } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import ConversationMessageComponent from "./conversation-message"
import ContextSummary from "./context-summary"

interface ConversationPanelProps {
  clientId: string
  conversationId: string
  isOpen: boolean
  onClose: () => void
}

export default function ConversationPanel({
  clientId,
  conversationId,
  isOpen,
  onClose,
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showContextSummary, setShowContextSummary] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setCurrentUserId('local-admin-goat')
  }, [])

  useEffect(() => {
    if (!isOpen || !conversationId) return

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("messages")
          .eq("id", conversationId)
          .single()

        if (error) throw error

        if (data?.messages && Array.isArray(data.messages)) {
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    fetchMessages()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          if (
            payload.new &&
            typeof payload.new === "object" &&
            "messages" in payload.new
          ) {
            const newMessages = (payload.new as { messages?: unknown })
              .messages
            if (Array.isArray(newMessages)) {
              setMessages(newMessages)
            }
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [isOpen, conversationId, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUserId) return

    setIsLoading(true)
    try {
      const newMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        sender_id: currentUserId,
        sender_role: "admin",
        content: inputValue,
        timestamp: new Date().toISOString(),
      }

      const { data: conversation } = await supabase
        .from("conversations")
        .select("messages")
        .eq("id", conversationId)
        .single()

      const currentMessages = Array.isArray(conversation?.messages)
        ? conversation.messages
        : []

      const { error } = await supabase
        .from("conversations")
        .update({
          messages: [...currentMessages, newMessage],
        })
        .eq("id", conversationId)

      if (error) throw error

      setInputValue("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Discussion</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Context Summary Toggle */}
      <div className="px-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowContextSummary(!showContextSummary)}
          className="w-full"
        >
          Résumer le contexte
        </Button>
      </div>

      {/* Context Summary */}
      {showContextSummary && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-200">
          <ContextSummary clientId={clientId} conversationId={conversationId} />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mt-8">
            Aucun message pour le moment
          </div>
        ) : (
          messages.map((message) => (
            <ConversationMessageComponent
              key={message.id}
              message={message}
              currentUserId={currentUserId || ""}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Votre message..."
          className="min-h-20 resize-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              handleSendMessage()
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="w-full"
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </Button>
      </div>
    </div>
  )
}
