'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader } from 'lucide-react'

interface MvpDemoToolbarProps {
  onModify: (instruction: string) => Promise<void>
  onToggleConversation: () => void
  isProcessing: boolean
  clientName: string
}

export function MvpDemoToolbar({
  onModify,
  onToggleConversation,
  isProcessing,
  clientName,
}: MvpDemoToolbarProps) {
  const [instruction, setInstruction] = useState('')

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instruction.trim()) return

    try {
      await onModify(instruction)
      setInstruction('')
    } catch (error) {
      console.error('Modification failed:', error)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-96 max-w-[calc(100vw-32px)]">
        {/* Title */}
        <p className="text-xs font-semibold text-slate-500 mb-3 block">
          Modifications rapides
        </p>

        {/* Input Form */}
        <form onSubmit={handleModify} className="flex gap-2 mb-3">
          <Input
            placeholder="Décris ta modification..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isProcessing}
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isProcessing || !instruction.trim()}
            className="gap-2"
          >
            {isProcessing ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>

        {/* Conversation Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleConversation}
          className="w-full gap-2"
        >
          <MessageCircle size={16} />
          Discuter avec {clientName}
        </Button>

        {/* Status */}
        {isProcessing && (
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
            <Loader size={12} className="animate-spin" />
            L&apos;IA traite votre demande...
          </p>
        )}
      </div>
    </div>
  )
}
