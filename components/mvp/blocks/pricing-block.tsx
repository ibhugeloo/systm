'use client'

import { MvpBlock, PricingBlockContent } from '@/types/mvp'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface PricingBlockProps {
  block: MvpBlock
}

export function PricingBlock({ block }: PricingBlockProps) {
  const content = block.content as PricingBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">{content.title || 'Tarification'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {(content.plans || []).map((plan, idx) => (
          <Card
            key={idx}
            className={`p-8 flex flex-col ${
              idx === 1 ? 'ring-2 ring-blue-500 shadow-lg' : 'bg-slate-50'
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-slate-600 mb-6 text-sm">{plan.description}</p>
            <div className="text-4xl font-bold mb-8">
              {plan.price}
              <span className="text-lg text-slate-600">/mois</span>
            </div>
            <div className="flex-1 space-y-3 mb-8">
              {(plan.features || []).map((feature, fidx) => (
                <div key={fidx} className="flex items-center gap-2">
                  <Check size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" variant={idx === 1 ? 'default' : 'outline'}>
              Choisir ce plan
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
