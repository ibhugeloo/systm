'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  sender_role: 'admin' | 'team_member' | 'client'
  content: string
  timestamp: string
}

interface MvpConversationPanelProps {
  messages: Message[]
}

export function MvpConversationPanel({
  messages: initialMessages,
}: MvpConversationPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender_id: 'current-user',
      sender_role: 'team_member',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setInput('')
  }

  const getSenderName = (role: string) => {
    switch (role) {
      case 'client':
        return 'Client'
      case 'admin':
        return 'Admin'
      case 'team_member':
        return 'You'
      default:
        return 'User'
    }
  }

  const getSenderInitial = (role: string) => {
    switch (role) {
      case 'client':
        return 'C'
      case 'admin':
        return 'A'
      case 'team_member':
        return 'T'
      default:
        return 'U'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender_role === 'team_member' ? 'justify-end' : ''
            }`}
          >
            {message.sender_role !== 'team_member' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {getSenderInitial(message.sender_role)}
                </AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-xs ${
                message.sender_role === 'team_member'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              } rounded-lg px-4 py-2`}
            >
              {message.sender_role !== 'team_member' && (
                <p className="text-xs font-semibold mb-1 opacity-75">
                  {getSenderName(message.sender_role)}
                </p>
              )}
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender_role === 'team_member'
                    ? 'opacity-70'
                    : 'text-slate-500'
                }`}
              >
                {formatDistanceToNow(new Date(message.timestamp))}
              </p>
            </div>

            {message.sender_role === 'team_member' && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-blue-500 text-white">
                  T
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={!input.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}
