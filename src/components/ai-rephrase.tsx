'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Wand2,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Copy,
  Check,
} from 'lucide-react'

type RephraseMode = 'professional' | 'concise' | 'impactful' | 'quantified' | 'action-oriented'

interface RephraseResult {
  original: string
  rephrased: string
  improvements: string[]
  mode: RephraseMode
  confidence: number
}

interface AIRephraseProps {
  initialText?: string
  onApply?: (rephrased: string) => void
  showComparison?: boolean
  compact?: boolean
}

const MODES = {
  professional: {
    label: 'Professional',
    description: 'Formal, polished language',
    icon: Target,
    color: 'text-blue-500',
  },
  concise: {
    label: 'Concise',
    description: 'Brief and impactful',
    icon: Zap,
    color: 'text-yellow-500',
  },
  impactful: {
    label: 'Impactful',
    description: 'Emphasize achievements',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  quantified: {
    label: 'Quantified',
    description: 'Add metrics and numbers',
    icon: BarChart3,
    color: 'text-purple-500',
  },
  'action-oriented': {
    label: 'Action-Oriented',
    description: 'Strong action verbs',
    icon: Sparkles,
    color: 'text-pink-500',
  },
}

export function AIRephrase({ initialText = '', onApply, showComparison = true, compact = false }: AIRephraseProps) {
  const [text, setText] = useState(initialText)
  const [mode, setMode] = useState<RephraseMode>('professional')
  const [result, setResult] = useState<RephraseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleRephrase = async () => {
    if (!text.trim()) {
      setError('Please enter some text to rephrase')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cv/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mode,
          preserveStructure: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to rephrase text')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (result && onApply) {
      onApply(result.rephrased)
    }
  }

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.rephrased)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const ModeIcon = MODES[mode].icon

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Select value={mode} onValueChange={(v) => setMode(v as RephraseMode)}>
            <SelectTrigger className="w-[180px] bg-[#0f172a]/80 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRephrase}
            disabled={loading || !text.trim()}
            size="sm"
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Rephrase
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="p-3 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
            <p className="text-sm text-white mb-2">{result.rephrased}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleApply}
                className="text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="text-slate-400 hover:bg-white/5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ModeIcon className={`w-5 h-5 ${MODES[mode].color}`} />
          <h3 className="text-lg font-semibold text-white">AI Content Rephraser</h3>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to improve..."
          rows={4}
          className="bg-[#0f172a]/80 border-white/10 text-white placeholder:text-slate-500 resize-none mb-4"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={mode} onValueChange={(v) => setMode(v as RephraseMode)}>
            <SelectTrigger className="sm:w-[200px] bg-[#0f172a]/80 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-slate-500">{config.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRephrase}
            disabled={loading || !text.trim()}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Rephrasing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Rephrase with AI
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Comparison */}
          {showComparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
                <h4 className="text-sm font-semibold text-slate-400 mb-3">ORIGINAL</h4>
                <p className="text-white leading-relaxed">{result.original}</p>
                <div className="mt-4 text-xs text-slate-500">
                  {result.original.split(' ').length} words
                </div>
              </Card>

              {/* Rephrased */}
              <Card className="bg-[#0ea5e9]/10 backdrop-blur-sm border-[#0ea5e9]/20 p-6 relative">
                <div className="absolute top-3 right-3">
                  <Badge className="bg-[#0ea5e9]/20 border-[#0ea5e9]/30 text-[#0ea5e9]">
                    {Math.round(result.confidence * 100)}% confidence
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-[#0ea5e9] mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  IMPROVED ({MODES[mode].label})
                </h4>
                <p className="text-white leading-relaxed font-medium">{result.rephrased}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    {result.rephrased.split(' ').length} words
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopy}
                      className="text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    {onApply && (
                      <Button
                        size="sm"
                        onClick={handleApply}
                        className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Improvements */}
          {result.improvements.length > 0 && (
            <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#22d3ee]" />
                What Changed
              </h4>
              <div className="space-y-2">
                {result.improvements.map((improvement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#22d3ee]/5 border border-[#22d3ee]/10"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">{improvement}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Mode Info */}
          <Card className="bg-gradient-to-br from-[#0ea5e9]/10 to-[#22d3ee]/10 backdrop-blur-sm border-[#0ea5e9]/20 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-[#0ea5e9]/20 border border-[#0ea5e9]/30">
                <ModeIcon className={`w-6 h-6 ${MODES[mode].color}`} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {MODES[mode].label} Mode
                </h4>
                <p className="text-sm text-slate-400">{MODES[mode].description}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
