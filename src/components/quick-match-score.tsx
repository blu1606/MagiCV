'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { NumberTicker } from '@/components/ui/number-ticker'
import Link from 'next/link'
import { MissingSkillsWidget } from '@/components/missing-skills-widget'

interface QuickMatchScoreProps {
  userId?: string
  variant?: 'default' | 'compact'
}

interface MatchResult {
  score: number
  breakdown: {
    experienceMatch: number
    educationMatch: number
    skillsMatch: number
    projectsMatch: number
  }
  suggestions: string[]
  missingSkills: string[]
  metadata: {
    calculationTime: number
    cached: boolean
    timestamp: string
  }
}

export function QuickMatchScore({ userId, variant = 'default' }: QuickMatchScoreProps) {
  const { toast } = useToast()
  const [jobDescription, setJobDescription] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [showInput, setShowInput] = useState(false)

  const calculateScore = async () => {
    if (!jobDescription.trim() || jobDescription.length < 50) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a job description (at least 50 characters)',
        variant: 'destructive',
      })
      return
    }

    setIsCalculating(true)

    try {
      const response = await fetch('/api/cv/match-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          useCache: true,
          topK: 50,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate match score')
      }

      const data = await response.json()
      setResult(data)

      toast({
        title: 'Match Score Calculated!',
        description: `Your profile matches ${Math.round(data.score)}% with this job`,
      })
    } catch (error: any) {
      console.error('Error calculating match score:', error)
      toast({
        title: 'Calculation Failed',
        description: error.message || 'Failed to calculate match score',
        variant: 'destructive',
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500'
    if (score >= 70) return 'text-[#0ea5e9]'
    if (score >= 50) return 'text-[#f97316]'
    return 'text-red-500'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-500'
    if (score >= 70) return 'from-[#0ea5e9] to-[#22d3ee]'
    if (score >= 50) return 'from-[#f97316] to-yellow-500'
    return 'from-red-500 to-orange-500'
  }

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-br from-[#0ea5e9]/10 to-[#22d3ee]/10 border-[#0ea5e9]/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
              <Target className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Quick Match</h3>
              <p className="text-xs text-slate-400">Test your profile</p>
            </div>
          </div>
          <Link href="/cv-optimizer">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-[#0ea5e9] hover:text-[#22d3ee] hover:bg-[#0ea5e9]/10"
            >
              <span className="text-xs">Open</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-[#0ea5e9]/10 to-[#22d3ee]/10 border-[#0ea5e9]/20 p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
            <Target className="w-6 h-6 text-[#0ea5e9]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Quick Match Score
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Test how well your profile matches a job description
            </p>

            {!showInput && !result && (
              <Button
                onClick={() => setShowInput(true)}
                className="gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] hover:from-[#0ea5e9]/90 hover:to-[#22d3ee]/90 text-white"
              >
                <Sparkles className="w-4 h-4" />
                Calculate Match Score
              </Button>
            )}

            {showInput && !result && (
              <div className="space-y-3">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here (min 50 characters)..."
                  className="min-h-32 resize-none bg-[#0f172a]/60 border-white/20 text-white placeholder:text-gray-400"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={calculateScore}
                    disabled={isCalculating || jobDescription.length < 50}
                    className="gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] hover:from-[#0ea5e9]/90 hover:to-[#22d3ee]/90 text-white"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Calculate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInput(false)
                      setJobDescription('')
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#0f172a]/60 border border-white/10">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">
                      Overall Match
                    </h4>
                    <p className="text-xs text-slate-400">
                      {result.metadata.cached ? '⚡ Cached result' : '✨ Fresh calculation'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-4xl font-bold ${getScoreColor(result.score)}`}
                    >
                      <NumberTicker value={Math.round(result.score)} />%
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-[#0f172a]/60 border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Experience</div>
                    <div className="text-lg font-bold text-[#0ea5e9]">
                      {Math.round(result.breakdown.experienceMatch)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f172a]/60 border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Skills</div>
                    <div className="text-lg font-bold text-[#22d3ee]">
                      {Math.round(result.breakdown.skillsMatch)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f172a]/60 border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Education</div>
                    <div className="text-lg font-bold text-purple-400">
                      {Math.round(result.breakdown.educationMatch)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0f172a]/60 border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Projects</div>
                    <div className="text-lg font-bold text-green-400">
                      {Math.round(result.breakdown.projectsMatch)}%
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Link href="/cv-optimizer" className="flex-1">
                    <Button className="w-full gap-2 bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] hover:from-[#0ea5e9]/90 hover:to-[#22d3ee]/90 text-white">
                      <TrendingUp className="w-4 h-4" />
                      Optimize Score
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null)
                      setJobDescription('')
                      setShowInput(false)
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Missing Skills Widget */}
      {result && result.missingSkills.length > 0 && (
        <MissingSkillsWidget
          missingSkills={result.missingSkills}
          variant="compact"
          showRecommendations={false}
        />
      )}

      {/* Suggestions */}
      {result && result.suggestions.length > 0 && (
        <Card className="bg-[#0f172a]/80 border-white/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Suggestions</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                {result.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#22d3ee]">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
