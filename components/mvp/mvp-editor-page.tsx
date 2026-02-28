'use client'

import { useState, useCallback, useEffect } from 'react'
import { MvpCanvas, MvpBlock, MvpBlockType } from '@/types/mvp'
import MvpCanvasComponent from './mvp-canvas'
import MvpToolbar from './mvp-toolbar'
import MvpPreview from './mvp-preview'
import { generateId } from '@/lib/utils'

interface MvpEditorPageProps {
  initialCanvas: MvpCanvas
  clientId: string
  mvpId: string
  onSave: (canvas: MvpCanvas) => Promise<void>
}

export function MvpEditorPage({
  initialCanvas,
  clientId,
  mvpId,
  onSave,
}: MvpEditorPageProps) {
  const [canvas, setCanvas] = useState<MvpCanvas>(initialCanvas)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [mode, setMode] = useState<'edit' | 'present'>('edit')

  // Auto-save canvas
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(canvas)
    }, 1000)

    return () => clearTimeout(timer)
  }, [canvas, onSave])

  const handleCanvasUpdate = useCallback((updatedCanvas: MvpCanvas) => {
    setCanvas(updatedCanvas)
  }, [])

  const handleUpdateBlock = useCallback((blockId: string, updates: Partial<MvpBlock>) => {
    setCanvas((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      ),
    }))
  }, [])

  if (mode === 'present') {
    return <MvpPreview canvas={canvas} onExit={() => setMode('edit')} />
  }

  return (
    <div className="flex flex-col h-screen">
      <MvpToolbar
        mvpId={mvpId}
        canvas={canvas}
        selectedBlockId={selectedBlockId}
        onCanvasUpdate={handleCanvasUpdate}
        mode={mode}
        onModeChange={setMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <MvpCanvasComponent
          canvas={canvas}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onUpdateBlock={handleUpdateBlock}
          isEditing={true}
          mvpId={mvpId}
        />
      </div>
    </div>
  )
}
