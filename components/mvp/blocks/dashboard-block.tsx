'use client'

import { MvpBlock, DashboardBlockContent } from '@/types/mvp'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface DashboardBlockProps {
  block: MvpBlock
}

export function DashboardBlock({ block }: DashboardBlockProps) {
  const content = block.content as DashboardBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-slate-50">
      <h2 className="text-2xl font-bold mb-6">{content.title || 'Tableau de bord'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {(content.widgets || []).map((widget) => (
          <Card key={widget.id} className="p-6 flex flex-col justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-2">{widget.title}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{widget.metric}</span>
                <TrendingUp size={16} className="text-green-600" />
              </div>
            </div>
            <div className="h-12 bg-gradient-to-r from-blue-200 to-blue-100 rounded mt-4 flex items-end">
              <div className="h-6 w-2 bg-blue-500 rounded mx-0.5 flex-1" />
              <div className="h-8 w-2 bg-blue-600 rounded mx-0.5 flex-1" />
              <div className="h-4 w-2 bg-blue-400 rounded mx-0.5 flex-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
