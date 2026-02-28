'use client'

import { useState, useCallback } from 'react'
import { MvpCanvas } from '@/types/mvp'
import MvpPreview from './mvp-preview'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface Conversation {
  id: string
  messages: Array<{
    id: string
    sender_id: string
    sender_role: 'admin' | 'team_member' | 'client'
    content: string
    timestamp: string
  }>
}

interface MvpDemoPageProps {
  canvas: MvpCanvas
  clientId: string
  clientName: string
  conversation: Conversation
  onModify: (instruction: string) => Promise<MvpCanvas>
}

export function MvpDemoPage({
  canvas: initialCanvas,
  clientId,
  clientName,
  conversation,
  onModify,
}: MvpDemoPageProps) {
  const [canvas, setCanvas] = useState<MvpCanvas>(initialCanvas)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [isPreview, setIsPreview] = useState(true)

  const handleModify = useCallback(
    async (instruction: string) => {
      setIsProcessing(true)
      try {
        const modifiedCanvas = await onModify(instruction)
        setCanvas(modifiedCanvas)
      } catch (error) {
        console.error('Modification failed:', error)
      } finally {
        setIsProcessing(false)
      }
    },
    [onModify]
  )

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* MVP Preview */}
      <MvpPreview canvas={canvas} onExit={() => setIsPreview(false)} />

      {/* Conversation Panel */}
      <Sheet open={showConversation} onOpenChange={setShowConversation}>
        <SheetContent side="right" className="w-96 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle>Conversation with {clientName}</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-3 overflow-auto h-full">
            {conversation.messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium">{msg.sender_role}: </span>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
