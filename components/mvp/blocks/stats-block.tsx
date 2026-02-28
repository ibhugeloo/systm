'use client'

import { MvpBlock, StatsBlockContent } from '@/types/mvp'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsBlockProps {
  block: MvpBlock
}

export function StatsBlock({ block }: StatsBlockProps) {
  const content = block.content as StatsBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      {content.title && (
        <h2 className="text-2xl font-bold mb-6">{content.title}</h2>
      )}
      <div className="flex flex-1 items-center justify-around gap-4">
        {(content.stats || []).map((stat, idx) => {
          const isPositive = !stat.change || !stat.change.startsWith('-')
          return (
            <div key={idx} className="text-center">
              <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
              {stat.change && (
                <div
                  className={`flex items-center justify-center gap-1 text-sm ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
