"use client";

import React, { useState } from "react";
import { MvpCanvas, MvpBlock } from "@/types/mvp";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Undo2,
  Redo2,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MvpToolbarProps {
  mvpId: string;
  canvas: MvpCanvas;
  selectedBlockId: string | null;
  onCanvasUpdate: (canvas: MvpCanvas) => void;
  mode: "edit" | "present";
  onModeChange: (mode: "edit" | "present") => void;
}

const MvpToolbar: React.FC<MvpToolbarProps> = ({
  mvpId,
  canvas,
  selectedBlockId,
  onCanvasUpdate,
  mode,
  onModeChange,
}) => {
  const [modification, setModification] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<MvpCanvas[]>([canvas]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const handleModify = async () => {
    if (!modification.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/modify-mvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mvpId,
          modification,
          currentCanvas: canvas,
        }),
      });

      if (!response.ok) throw new Error("Failed to modify MVP");

      const result = await response.json();
      let updatedCanvas = canvas;
      if (result.canvas) {
        updatedCanvas = result.canvas;
        onCanvasUpdate(updatedCanvas);
      }

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(updatedCanvas);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setModification("");
    } catch (error) {
      console.error("Modification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = (type: MvpBlock["type"]) => {
    const newBlock: MvpBlock = {
      id: `block-${Date.now()}`,
      type,
      row: 1,
      col: 1,
      width: 4,
      height: 3,
      data: {},
    };

    const updatedCanvas: MvpCanvas = {
      ...canvas,
      blocks: [...(canvas.blocks || []), newBlock],
    };

    onCanvasUpdate(updatedCanvas);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedCanvas);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleDeleteSelected = () => {
    if (!selectedBlockId) return;

    const updatedCanvas: MvpCanvas = {
      ...canvas,
      blocks: canvas.blocks?.filter((b) => b.id !== selectedBlockId) || [],
    };

    onCanvasUpdate(updatedCanvas);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedCanvas);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onCanvasUpdate(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onCanvasUpdate(history[newIndex]);
    }
  };

  const blockTypes: Array<MvpBlock["type"]> = [
    "hero",
    "features",
    "pricing",
    "testimonials",
    "cta",
    "dashboard",
    "form",
    "data-table",
    "stats",
    "custom",
  ];

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white flex-wrap">
      {/* Left: Modification Input */}
      <div className="flex-1 min-w-64 flex gap-2">
        <Textarea
          placeholder="Décris ta modification..."
          value={modification}
          onChange={(e) => setModification(e.target.value)}
          disabled={isLoading}
          className="max-h-20"
          rows={1}
        />
        <Button
          onClick={handleModify}
          disabled={isLoading || !modification.trim()}
          className="px-3"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Add Block Dropdown */}
        <Select onValueChange={(value) => handleAddBlock(value as MvpBlock["type"])}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Add Block" />
          </SelectTrigger>
          <SelectContent>
            {blockTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Delete Selected */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={!selectedBlockId}
          title="Delete selected block"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Undo/Redo */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={historyIndex === 0}
          title="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRedo}
          disabled={historyIndex === history.length - 1}
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300" />

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "edit" ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange("edit")}
          >
            Édition
          </Button>
          <Button
            variant={mode === "present" ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange("present")}
          >
            Présentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MvpToolbar;
