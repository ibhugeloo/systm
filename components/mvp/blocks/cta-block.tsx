'use client'

import { MvpBlock, CtaBlockContent } from '@/types/mvp'
import { Button } from '@/components/ui/button'

interface CtaBlockProps {
  block: MvpBlock
}

export function CtaBlock({ block }: CtaBlockProps) {
  const content = block.content as CtaBlockContent

  return (
    <div className="h-full flex items-center justify-center p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="text-center max-w-xl">
        <p className="text-2xl font-semibold mb-6">
          {content.description || 'Prêt à commencer ?'}
        </p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
          {content.ctaText || 'Commencer'}
        </Button>
      </div>
    </div>
  )
}
