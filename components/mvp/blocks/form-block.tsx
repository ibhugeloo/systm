'use client'

import { MvpBlock, FormBlockContent } from '@/types/mvp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface FormBlockProps {
  block: MvpBlock
}

export function FormBlock({ block }: FormBlockProps) {
  const content = block.content as FormBlockContent

  return (
    <div className="h-full flex flex-col p-8 bg-white">
      <h2 className="text-2xl font-bold mb-2">{content.title || 'Nous contacter'}</h2>
      <p className="text-slate-600 mb-6">{content.description || ''}</p>
      <form className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {(content.fields || []).map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <Textarea
                  placeholder={field.placeholder || ''}
                  disabled
                  className="bg-slate-50"
                />
              ) : (
                <Input
                  type={field.type === 'email' ? 'email' : 'text'}
                  placeholder={field.placeholder || ''}
                  disabled
                  className="bg-slate-50"
                />
              )}
            </div>
          ))}
        </div>
        <Button className="w-full" disabled>
          {content.submitButtonText || 'Envoyer'}
        </Button>
      </form>
    </div>
  )
}
