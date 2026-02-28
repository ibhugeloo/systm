'use client'

import { MvpBlock, HeroBlockContent } from '@/types/mvp'
import { Button } from '@/components/ui/button'

interface HeroBlockProps {
  block: MvpBlock
}

export function HeroBlock({ block }: HeroBlockProps) {
  const content = block.content as HeroBlockContent

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
        {content.title || 'Your Amazing Headline'}
      </h1>
      <p className="text-xl text-slate-200 mb-8 max-w-2xl">
        {content.subtitle || 'Your subheadline goes here'}
      </p>
      <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
        {content.ctaText || 'Get Started'}
      </Button>
    </div>
  )
}
