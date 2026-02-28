'use client'

import { MvpBlock, FeaturesBlockContent } from '@/types/mvp'
import { Card } from '@/components/ui/card'
import { Lightbulb, Zap, Shield } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  lightbulb: Lightbulb,
  zap: Zap,
  shield: Shield,
}

interface FeaturesBlockProps {
  block: MvpBlock
}

export function FeaturesBlock({ block }: FeaturesBlockProps) {
  const content = block.content as FeaturesBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      <h2 className="text-3xl font-bold mb-2">{content.title || 'Features'}</h2>
      <p className="text-slate-600 mb-8">{content.description || ''}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {(content.items || []).map((feature: { icon?: string; title: string; description: string }, idx: number) => {
          const IconComponent = iconMap[feature.icon || ''] || Lightbulb
          return (
            <Card key={idx} className="p-6 bg-slate-50 hover:shadow-md transition-shadow">
              <IconComponent size={32} className="text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
