'use client'

import { MvpBlock } from '@/types/mvp'

interface CustomBlockProps {
  block: MvpBlock
}

export function CustomBlock({ block }: CustomBlockProps) {
  const content = block.content as Record<string, unknown>

  return (
    <div className="h-full flex items-center justify-center p-8 bg-white">
      <div className="text-center">
        <p className="text-slate-600 text-sm mb-4">Custom Block</p>
        {typeof content.html === 'string' && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )}
        {!content.html && (
          <p className="text-slate-400">No content</p>
        )}
      </div>
    </div>
  )
}
