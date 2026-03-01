"use client"

import { ConversationMessage } from "@/types/database"
import { Bot } from "lucide-react"

interface ConversationMessageComponentProps {
  message: ConversationMessage
  currentUserId: string
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "à l'instant"
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `il y a ${hours} heure${hours > 1 ? "s" : ""}`
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `il y a ${days} jour${days > 1 ? "s" : ""}`
  }

  return date.toLocaleDateString("fr-FR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function ConversationMessageComponent({
  message,
  currentUserId,
}: ConversationMessageComponentProps) {
  const isCurrentUser = message.sender_id === currentUserId
  const isAI = message.sender_role === "ai"

  const getBubbleStyles = () => {
    if (isAI) {
      return {
        container: "justify-start",
        bubble: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
      }
    }
    if (isCurrentUser) {
      return {
        container: "justify-end",
        bubble: "bg-blue-500 text-white",
      }
    }
    return {
      container: "justify-start",
      bubble: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200",
    }
  }

  const styles = getBubbleStyles()
  const timestamp = formatRelativeTime(message.timestamp)

  const getRoleName = () => {
    switch (message.sender_role) {
      case "admin":
        return "Administrateur"
      case "team_member":
        return "Équipe"
      case "client":
        return "Client"
      case "ai":
        return "Assistant IA"
      default:
        return "Utilisateur"
    }
  }

  return (
    <div className={`flex ${styles.container}`}>
      <div className="max-w-xs">
        {isAI && (
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {getRoleName()}
            </span>
          </div>
        )}
        {!isAI && !isCurrentUser && (
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {getRoleName()}
          </div>
        )}
        <div className={`rounded-lg px-3 py-2 ${styles.bubble}`}>
          <p className="text-sm break-words">{message.content}</p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {timestamp}
        </div>
      </div>
    </div>
  )
}
