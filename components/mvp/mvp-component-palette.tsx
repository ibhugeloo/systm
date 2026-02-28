"use client";

import React from "react";
import { MvpBlock } from "@/types/mvp";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Grid3x3,
  DollarSign,
  MessageSquare,
  Megaphone,
  BarChart3,
  FileText,
  Table,
  TrendingUp,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MvpComponentPaletteProps {
  onAddBlock: (type: MvpBlock["type"]) => void;
}

interface PaletteItem {
  type: MvpBlock["type"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Layout" | "Grid" | "Pricing" | "Social" | "CTA" | "Data" | "Other";
}

const MvpComponentPalette: React.FC<MvpComponentPaletteProps> = ({
  onAddBlock,
}) => {
  const items: PaletteItem[] = [
    { type: "hero", label: "Héros", icon: Layout, category: "Layout" },
    { type: "features", label: "Fonctionnalités", icon: Grid3x3, category: "Grid" },
    { type: "pricing", label: "Tarification", icon: DollarSign, category: "Pricing" },
    {
      type: "testimonials",
      label: "Témoignages",
      icon: MessageSquare,
      category: "Social",
    },
    { type: "cta", label: "Appel à l'action", icon: Megaphone, category: "CTA" },
    { type: "dashboard", label: "Tableau de bord", icon: BarChart3, category: "Data" },
    { type: "form", label: "Formulaire", icon: FileText, category: "Data" },
    { type: "data-table", label: "Tableau de données", icon: Table, category: "Data" },
    { type: "stats", label: "Statistiques", icon: TrendingUp, category: "Data" },
    { type: "custom", label: "Personnalisé", icon: Code, category: "Other" },
  ];

  const categories = ["Layout", "Grid", "Pricing", "Social", "CTA", "Data", "Other"] as const;

  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 overflow-auto h-screen">
      <h2 className="font-semibold text-lg mb-4">Composants</h2>

      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              {category}
            </h3>
            <div className="space-y-2">
              {categoryItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => onAddBlock(item.type)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer?.setData(
                        "application/json",
                        JSON.stringify({ type: item.type })
                      );
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg",
                      "border border-gray-200 bg-white",
                      "hover:border-blue-400 hover:bg-blue-50",
                      "transition-colors cursor-move active:cursor-grabbing",
                      "text-left text-sm font-medium text-gray-700"
                    )}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          Glissez-déposez les composants sur le canvas ou cliquez pour ajouter.
        </p>
      </div>
    </div>
  );
};

export default MvpComponentPalette;
