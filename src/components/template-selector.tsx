'use client'

import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useState } from 'react'

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'professional'

interface Template {
  id: TemplateId
  name: string
  description: string
  preview: string
  available: boolean
}

const TEMPLATES: Template[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design with bold headers',
    preview: '/templates/modern-preview.png',
    available: true,
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional format perfect for conservative industries',
    preview: '/templates/classic-preview.png',
    available: false, // Coming soon
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simplified layout focusing on content',
    preview: '/templates/minimal-preview.png',
    available: false, // Coming soon
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Structured format with emphasis on achievements',
    preview: '/templates/professional-preview.png',
    available: false, // Coming soon
  },
]

interface TemplateSelectorProps {
  selected: TemplateId
  onSelect: (templateId: TemplateId) => void
  compact?: boolean
}

export function TemplateSelector({ selected, onSelect, compact = false }: TemplateSelectorProps) {
  if (compact) {
    return (
      <div className="flex gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => template.available && onSelect(template.id)}
            disabled={!template.available}
            className={`relative px-4 py-2 rounded-lg border transition-all ${
              selected === template.id
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9]'
                : template.available
                ? 'border-white/20 bg-[#0f172a]/60 text-white hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
                : 'border-white/10 bg-[#0f172a]/30 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              {selected === template.id && <Check className="w-4 h-4" />}
              <span className="text-sm font-medium">{template.name}</span>
              {!template.available && (
                <span className="text-xs text-gray-500">(Soon)</span>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TEMPLATES.map((template) => (
        <Card
          key={template.id}
          className={`relative p-4 cursor-pointer transition-all border-2 ${
            selected === template.id
              ? 'border-[#0ea5e9] bg-[#0ea5e9]/5'
              : template.available
              ? 'border-white/20 bg-[#0f172a]/60 hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5'
              : 'border-white/10 bg-[#0f172a]/30 cursor-not-allowed opacity-60'
          }`}
          onClick={() => template.available && onSelect(template.id)}
        >
          {/* Selected Indicator */}
          {selected === template.id && (
            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0ea5e9] flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Template Preview */}
          <div className="mb-3 aspect-[3/4] bg-white/5 rounded-lg overflow-hidden relative">
            {/* Placeholder pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white/20 mb-2">
                  {template.name.charAt(0)}
                </div>
                <div className="text-xs text-white/30">{template.name}</div>
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-white">{template.name}</h4>
              {!template.available && (
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{template.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
