"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ConversationMessage } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, MessageCircle, Sparkles } from "lucide-react"
import ContextSummary from "./context-summary"

interface ConversationPanelProps {
  clientId: string
  conversationId: string
  isOpen: boolean
  onClose: () => void
  senderRole?: 'admin' | 'team_member' | 'client'
  senderId?: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffHr < 24) return `il y a ${diffHr}h`
  if (diffDay < 7) return `il y a ${diffDay}j`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

const ROLE_LABELS_ADMIN: Record<string, string> = {
  admin: "Vous",
  team_member: "Équipe",
  client: "Client",
}

const ROLE_LABELS_CLIENT: Record<string, string> = {
  admin: "Équipe",
  team_member: "Équipe",
  client: "Vous",
}

export default function ConversationPanel({
  clientId,
  conversationId,
  isOpen,
  onClose,
  senderRole = 'admin',
  senderId = 'local-admin-goat',
}: ConversationPanelProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showContextSummary, setShowContextSummary] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    setCurrentUserId(senderId)
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
        sender_role: senderRole,
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
    <div className="fixed right-0 top-0 h-screen w-full sm:w-[420px] bg-background shadow-2xl border-l flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Discussion</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 rounded-lg"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Context Summary Toggle */}
      <div className="px-4 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowContextSummary(!showContextSummary)}
          className="w-full gap-2 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Résumer le contexte
        </Button>
      </div>

      {showContextSummary && (
        <div className="px-4 pt-3 pb-2 border-b">
          <ContextSummary clientId={clientId} conversationId={conversationId} />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Aucun message pour le moment
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Commencez la discussion ci-dessous
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                      {(senderRole === 'client' ? ROLE_LABELS_CLIENT : ROLE_LABELS_ADMIN)[message.sender_role] || message.sender_role}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {timeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-muted/20">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Votre message..."
            className="min-h-10 max-h-24 resize-none text-sm rounded-xl"
            disabled={isLoading}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          Entrée pour envoyer, Maj+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  )
}
