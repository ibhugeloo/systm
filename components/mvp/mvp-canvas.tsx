"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MvpCanvas, MvpBlock } from "@/types/mvp";
import { cn } from "@/lib/utils";
import MvpBlockRenderer from "./mvp-block-renderer";

interface MvpCanvasProps {
  canvas: MvpCanvas;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateBlock: (blockId: string, updates: Partial<MvpBlock>) => void;
  isEditing: boolean;
  mvpId: string;
}

const MvpCanvasComponent: React.FC<MvpCanvasProps> = ({
  canvas,
  selectedBlockId,
  onSelectBlock,
  isEditing,
  mvpId,
}) => {
  const [localCanvas, setLocalCanvas] = useState<MvpCanvas>(canvas);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!mvpId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`mvps:${mvpId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mvps",
          filter: `id=eq.${mvpId}`,
        },
        (payload) => {
          const updatedCanvas = (payload.new as Record<string, unknown>).canvas_data as MvpCanvas;
          if (updatedCanvas) {
            setLocalCanvas(updatedCanvas);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mvpId]);

  // Update local state when props change
  useEffect(() => {
    setLocalCanvas(canvas);
  }, [canvas]);

  const handleBlockClick = (blockId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isEditing) {
      onSelectBlock(blockId);
    }
  };

  const handleCanvasClick = () => {
    if (isEditing) {
      onSelectBlock(null);
    }
  };

  const blocks = localCanvas.blocks || [];

  return (
    <div
      className="relative w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${localCanvas.gridCols || 12}, 1fr)`,
        gridAutoRows: `${localCanvas.gridRowHeight || 60}px`,
        gap: `${localCanvas.gap ?? 8}px`,
        padding: `${localCanvas.padding ?? 16}px`,
      }}
      onClick={handleCanvasClick}
    >
      {blocks.map((block) => (
        <div
          key={block.id}
          style={{
            gridColumn: `${block.col || 1} / span ${block.width || 12}`,
            gridRow: `${block.row || 1} / span ${block.height || 3}`,
          }}
          className={cn(
            "relative transition-all rounded-lg overflow-hidden",
            isEditing && selectedBlockId === block.id
              ? "ring-2 ring-blue-500 ring-offset-2"
              : "",
            isEditing ? "cursor-pointer hover:ring-1 hover:ring-gray-300" : ""
          )}
          onClick={(e) => handleBlockClick(block.id, e)}
        >
          <MvpBlockRenderer block={block} isSelected={selectedBlockId === block.id} isEditing={isEditing} />

          {/* Selection overlay */}
          {isEditing && selectedBlockId === block.id && (
            <div className="absolute -top-6 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
              {block.type}
            </div>
          )}
        </div>
      ))}

      {blocks.length === 0 && (
        <div className="col-span-full row-span-3 flex items-center justify-center text-gray-400 py-20">
          <p>Aucun bloc. Ajoutez des composants depuis la barre latérale.</p>
        </div>
      )}
    </div>
  );
};

export default MvpCanvasComponent;
