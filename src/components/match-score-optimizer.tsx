'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Award,
  Clock,
} from 'lucide-react'

interface MatchScoreResult {
  score: number
  breakdown: {
    experienceMatch: number
    educationMatch: number
    skillsMatch: number
    projectsMatch: number
  }
  suggestions: string[]
  missingSkills: string[]
  topMatchedComponents: any[]
  metadata?: {
    calculationTime: number
    cached: boolean
    timestamp: string
  }
}

interface MatchScoreOptimizerProps {
  userId: string
  initialJobDescription?: string
}

export function MatchScoreOptimizer({ userId, initialJobDescription }: MatchScoreOptimizerProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription || '')
  const [result, setResult] = useState<MatchScoreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateScore = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setLoading(true)
    setError(null)

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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const getScoreMessage = (score: number) => {
    if (score >= 85) return 'Excellent Match!'
    if (score >= 70) return 'Great Match'
    if (score >= 50) return 'Good Match'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#0ea5e9]" />
          Job Description
        </h2>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to analyze your match score..."
          rows={8}
          className="bg-[#0f172a]/80 border-white/10 text-white placeholder:text-slate-500 resize-none mb-4"
        />
        <div className="flex gap-3">
          <Button
            onClick={calculateScore}
            disabled={loading || !jobDescription.trim()}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Calculate Match Score
              </>
            )}
          </Button>
          {result && (
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Clear
            </Button>
          )}
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
          {/* Overall Score */}
          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-8 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(result.score)} opacity-5`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Overall Match Score</h2>
                  <p className="text-slate-400">{getScoreMessage(result.score)}</p>
                </div>
                {result.metadata?.cached && (
                  <Badge className="bg-green-500/10 border-green-500/20 text-green-500">
                    <Clock className="w-3 h-3 mr-1" />
                    Cached ({result.metadata.calculationTime}ms)
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score.toFixed(1)}%
                </div>
                {result.score >= 70 ? (
                  <TrendingUp className={`w-12 h-12 ${getScoreColor(result.score)}`} />
                ) : (
                  <TrendingDown className="w-12 h-12 text-red-500" />
                )}
              </div>

              <Progress value={result.score} className="h-3 mb-4" />

              <p className="text-sm text-slate-400">
                Your profile matches <span className="text-white font-semibold">{result.score.toFixed(1)}%</span> of the job requirements
              </p>
            </div>
          </Card>

          {/* Breakdown */}
          <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0ea5e9]" />
              Score Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Experience (40% weight)</span>
                  <span className="text-lg font-bold text-white">
                    {result.breakdown.experienceMatch.toFixed(1)}%
                  </span>
                </div>
                <Progress value={(result.breakdown.experienceMatch / 40) * 100} className="h-2" />
              </div>

              {/* Skills */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Skills (30% weight)</span>
                  <span className="text-lg font-bold text-white">
                    {result.breakdown.skillsMatch.toFixed(1)}%
                  </span>
                </div>
                <Progress value={(result.breakdown.skillsMatch / 30) * 100} className="h-2" />
              </div>

              {/* Education */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Education (20% weight)</span>
                  <span className="text-lg font-bold text-white">
                    {result.breakdown.educationMatch.toFixed(1)}%
                  </span>
                </div>
                <Progress value={(result.breakdown.educationMatch / 20) * 100} className="h-2" />
              </div>

              {/* Projects */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Projects (10% weight)</span>
                  <span className="text-lg font-bold text-white">
                    {result.breakdown.projectsMatch.toFixed(1)}%
                  </span>
                </div>
                <Progress value={(result.breakdown.projectsMatch / 10) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Missing Skills */}
          {result.missingSkills.length > 0 && (
            <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#f97316]" />
                Missing Skills ({result.missingSkills.length})
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                These skills are mentioned in the job description but not found in your profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316] hover:bg-[#f97316]/20 cursor-pointer"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#22d3ee]" />
                Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#22d3ee]/5 border border-[#22d3ee]/10"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Matched Components */}
          {result.topMatchedComponents.length > 0 && (
            <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Top Matched Components ({result.topMatchedComponents.length})
              </h3>
              <div className="space-y-3">
                {result.topMatchedComponents.slice(0, 5).map((component: any, index) => (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#0ea5e9]/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-[#0ea5e9]/10 border-[#0ea5e9]/20 text-[#0ea5e9] text-xs">
                          {component.type}
                        </Badge>
                        <span className="text-sm font-medium text-white">{component.title}</span>
                      </div>
                      {component.organization && (
                        <p className="text-xs text-slate-400">{component.organization}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#22d3ee]">
                        {((component.similarity || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-slate-500">similarity</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
