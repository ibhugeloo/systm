"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { MvpCanvas, MvpBlock } from "@/types/mvp";
import { createClient } from "@/lib/supabase/client";
import MvpCanvasComponent from "./mvp-canvas";
import MvpToolbar from "./mvp-toolbar";
import MvpComponentPalette from "./mvp-component-palette";
import MvpPreview from "./mvp-preview";

interface MvpClientWrapperProps {
  initialCanvas: MvpCanvas;
  mvpId: string;
  currentUserId: string;
}

const MvpClientWrapper: React.FC<MvpClientWrapperProps> = ({
  initialCanvas,
  mvpId,
  currentUserId,
}) => {
  const [canvas, setCanvas] = useState<MvpCanvas>(initialCanvas);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [mode, setMode] = useState<"edit" | "present">("edit");
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-save to Supabase (debounced 1.5s)
  const saveCanvas = useCallback(async (canvasToSave: MvpCanvas) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from('mvps')
        .update({ canvas_data: canvasToSave, updated_at: new Date().toISOString() })
        .eq('id', mvpId);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [mvpId]);

  useEffect(() => {
    if (canvas === initialCanvas) return; // Don't save on first render
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveCanvas(canvas), 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [canvas, saveCanvas, initialCanvas]);

  const handleAddBlock = (type: MvpBlock["type"]) => {
    // Find the last row to place the new block after all existing blocks
    const lastRow = canvas.blocks.reduce((max, b) => Math.max(max, (b.row || 1) + (b.height || 3)), 1);

    const newBlock: MvpBlock = {
      id: `block-${Date.now()}`,
      type,
      row: lastRow,
      col: 1,
      width: 12,
      height: 3,
      data: {},
    };

    setCanvas((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
    setSelectedBlockId(newBlock.id);
  };

  if (isPreviewOpen || mode === "present") {
    return (
      <MvpPreview
        canvas={canvas}
        onExit={() => {
          setIsPreviewOpen(false);
          setMode("edit");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <MvpComponentPalette onAddBlock={handleAddBlock} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <MvpToolbar
          mvpId={mvpId}
          canvas={canvas}
          selectedBlockId={selectedBlockId}
          onCanvasUpdate={setCanvas}
          mode={mode}
          onModeChange={setMode}
        />

        {/* Save indicator */}
        {isSaving && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-1 text-xs text-blue-600">
            Sauvegarde en cours...
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <MvpCanvasComponent
              canvas={canvas}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onUpdateBlock={() => {}}
              isEditing={mode === "edit"}
              mvpId={mvpId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MvpClientWrapper;
