'use client'

import { MvpBlock, TestimonialsBlockContent } from '@/types/mvp'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

interface TestimonialsBlockProps {
  block: MvpBlock
}

export function TestimonialsBlock({ block }: TestimonialsBlockProps) {
  const content = block.content as TestimonialsBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-slate-50">
      <h2 className="text-3xl font-bold text-center mb-12">{content.title || 'Témoignages'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {(content.testimonials || []).map((testimonial, idx) => (
          <Card key={idx} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic">"{testimonial.content}"</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {testimonial.author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{testimonial.author}</p>
                <p className="text-xs text-slate-600">{testimonial.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
