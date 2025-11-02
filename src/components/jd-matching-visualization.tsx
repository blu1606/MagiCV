'use client'

import { Target, TrendingUp, Briefcase, GraduationCap, Code, FolderKanban, AlertTriangle, Award, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CircularProgress } from '@/components/match-rating'
import { MatchCard } from '@/components/match-card'
import type { JDMatchingResults } from '@/lib/types/jd-matching'

interface JDMatchingVisualizationProps {
  results: JDMatchingResults
}

export function JDMatchingVisualization({ results }: JDMatchingVisualizationProps) {
  const {
    jdMetadata,
    matches,
    overallScore,
    categoryScores,
    suggestions,
    missingComponents,
  } = results

  // Group matches by quality
  const excellentMatches = matches.filter(m => m.matchQuality === 'excellent')
  const goodMatches = matches.filter(m => m.matchQuality === 'good')
  const fairMatches = matches.filter(m => m.matchQuality === 'fair')
  const weakMatches = matches.filter(m => m.matchQuality === 'weak')
  const noMatches = matches.filter(m => m.matchQuality === 'none')

  return (
    <div className="space-y-6">
      {/* Seniority Match Card */}
      {results.seniorityAnalysis && (
        <Card className={`backdrop-blur-sm ${
          results.seniorityAnalysis.isMatch
            ? 'bg-green-500/5 border-green-500/30'
            : results.seniorityAnalysis.gap === -1
            ? 'bg-blue-500/5 border-blue-500/30'
            : 'bg-orange-500/5 border-orange-500/30'
        }`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className={`w-5 h-5 ${
                results.seniorityAnalysis.isMatch
                  ? 'text-green-500'
                  : results.seniorityAnalysis.gap === -1
                  ? 'text-blue-500'
                  : 'text-orange-500'
              }`} />
              Seniority Level Match
            </CardTitle>
            <CardDescription className="text-[#94a3b8]">
              Analysis based on your experience and the job requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Level */}
              <div className="flex flex-col items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm text-[#94a3b8] mb-2">Your Level</span>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-lg px-4 py-1 capitalize">
                  {results.seniorityAnalysis.userLevel}
                </Badge>
                <span className="text-xs text-[#94a3b8] mt-2">{results.seniorityAnalysis.confidence}% confidence</span>
              </div>

              {/* Match Status */}
              <div className="flex flex-col items-center justify-center p-4">
                {results.seniorityAnalysis.isMatch ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                ) : (
                  <XCircle className="w-12 h-12 text-orange-500 mb-2" />
                )}
                <span className={`text-sm font-medium ${
                  results.seniorityAnalysis.isMatch ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {results.seniorityAnalysis.isMatch ? 'Good Match!' :
                   results.seniorityAnalysis.gap === -1 ? 'Stretch Opportunity' :
                   results.seniorityAnalysis.gap > 0 ? 'Overqualified' : 'Level Gap'}
                </span>
                {results.seniorityAnalysis.gap !== 0 && (
                  <span className="text-xs text-[#94a3b8] mt-1">
                    {Math.abs(results.seniorityAnalysis.gap)} level {Math.abs(results.seniorityAnalysis.gap) > 1 ? 'difference' : 'apart'}
                  </span>
                )}
              </div>

              {/* JD Level */}
              <div className="flex flex-col items-center p-4 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm text-[#94a3b8] mb-2">Required Level</span>
                <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20 text-lg px-4 py-1 capitalize">
                  {results.seniorityAnalysis.jdLevel}
                </Badge>
                <span className="text-xs text-[#94a3b8] mt-2">From job posting</span>
              </div>
            </div>

            {/* Advice */}
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                {results.seniorityAnalysis.advice}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Score Card */}
      <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-[#0ea5e9]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl mb-2">
                {jdMetadata.title}
              </CardTitle>
              <CardDescription className="text-[#94a3b8]">
                {jdMetadata.company} {jdMetadata.location && `• ${jdMetadata.location}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#0ea5e9]/5 rounded-lg border border-[#0ea5e9]/20">
              <CircularProgress value={overallScore} size={140} strokeWidth={10} />
              <div className="mt-4 text-center">
                <p className="text-sm text-[#94a3b8]">Overall Match Score</p>
                <p className="text-xs text-[#94a3b8]/60 mt-1">
                  Based on {matches.length} requirements
                </p>
              </div>
            </div>

            {/* Match Quality Breakdown */}
            <div className="space-y-4">
              <h3 className="text-white font-medium mb-3">Match Quality Breakdown</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-[#94a3b8]">Excellent (80-100%)</span>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {excellentMatches.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-[#94a3b8]">Good (60-79%)</span>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    {goodMatches.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-[#94a3b8]">Fair (40-59%)</span>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {fairMatches.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-[#94a3b8]">Weak (20-39%)</span>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                    {weakMatches.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-[#94a3b8]">No Match</span>
                  </div>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    {noMatches.length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0ea5e9]" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryScore
              icon={<Briefcase className="w-5 h-5" />}
              label="Experience"
              score={categoryScores.experience}
            />
            <CategoryScore
              icon={<GraduationCap className="w-5 h-5" />}
              label="Education"
              score={categoryScores.education}
            />
            <CategoryScore
              icon={<Code className="w-5 h-5" />}
              label="Skills"
              score={categoryScores.skills}
            />
            <CategoryScore
              icon={<FolderKanban className="w-5 h-5" />}
              label="Projects"
              score={categoryScores.projects}
            />
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-yellow-500/5 backdrop-blur-sm border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-yellow-500" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Missing Components Warning */}
      {missingComponents.length > 0 && (
        <Card className="bg-red-500/5 backdrop-blur-sm border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Missing Requirements ({missingComponents.length})
            </CardTitle>
            <CardDescription className="text-red-400/80">
              These requirements have no matching components in your CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missingComponents.slice(0, 5).map((component, i) => (
                <div
                  key={i}
                  className="p-3 bg-red-500/5 rounded-lg border border-red-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                      {component.type}
                    </Badge>
                    {component.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-white">{component.title}</p>
                  <p className="text-xs text-red-400/80 mt-1">{component.description}</p>
                </div>
              ))}
              {missingComponents.length > 5 && (
                <p className="text-xs text-[#94a3b8] text-center mt-2">
                  ... and {missingComponents.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Matches */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-[#0ea5e9]" />
          Detailed Component Matching ({matches.length})
        </h2>
        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard key={match.jdComponent.id} match={match} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CategoryScoreProps {
  icon: React.ReactNode
  label: string
  score: number
}

function CategoryScore({ icon, label, score }: CategoryScoreProps) {
  const getColor = () => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-orange-500'
  }

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <div className={getColor()}>{icon}</div>
        <span className="text-sm text-[#94a3b8]">{label}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-bold ${getColor()}`}>{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </div>
  )
}
