"use client";

import React from "react";
import { MvpCanvas } from "@/types/mvp";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MvpCanvasComponent from "./mvp-canvas";

interface MvpPreviewProps {
  canvas: MvpCanvas;
  onExit: () => void;
}

const MvpPreview: React.FC<MvpPreviewProps> = ({ canvas, onExit }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Canvas Container */}
      <div className="h-full w-full overflow-auto bg-white">
        <MvpCanvasComponent
          canvas={canvas}
          selectedBlockId={null}
          onSelectBlock={() => {}}
          onUpdateBlock={() => {}}
          isEditing={false}
          mvpId=""
        />
      </div>

      {/* Exit Button */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          onClick={onExit}
          variant="outline"
          size="lg"
          className="bg-white border-gray-200 shadow-lg hover:bg-gray-50"
        >
          <X className="h-5 w-5 mr-2" />
          Exit Preview
        </Button>
      </div>
    </div>
  );
};

export default MvpPreview;
