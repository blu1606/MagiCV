'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { MatchResult } from '@/lib/types/jd-matching'
import { getMatchBadgeVariant, getMatchColor } from '@/lib/types/jd-matching'

interface MatchCardProps {
  match: MatchResult
  index: number
}

export function MatchCard({ match, index }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { jdComponent, cvComponent, score, reasoning, matchQuality } = match

  // Get icon based on match quality
  const getIcon = () => {
    switch (matchQuality) {
      case 'excellent':
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'fair':
        return <Info className="w-5 h-5 text-yellow-500" />
      case 'weak':
      case 'none':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
  }

  return (
    <Card
      className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 hover:border-[#0ea5e9]/30 transition-all"
      style={{
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getIcon()}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                    {jdComponent.type}
                  </Badge>
                  {jdComponent.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <h3 className="text-white font-medium">{jdComponent.title}</h3>
                <p className="text-sm text-[#94a3b8] mt-1 line-clamp-2">
                  {jdComponent.description}
                </p>
              </div>
            </div>

            {/* Score Badge */}
            <Badge className={`${getMatchBadgeVariant(matchQuality)} ml-2 shrink-0`}>
              {score}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <Progress value={score} className="h-2" />

          {/* Matched Component */}
          {cvComponent ? (
            <div className="flex items-center gap-3 p-3 bg-[#0ea5e9]/5 rounded-lg border border-[#0ea5e9]/20">
              <ArrowRight className="w-5 h-5 text-[#0ea5e9] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20 text-xs">
                    {cvComponent.type}
                  </Badge>
                  {cvComponent.organization && (
                    <span className="text-xs text-[#94a3b8]">
                      @ {cvComponent.organization}
                    </span>
                  )}
                </div>
                <h4 className="text-white text-sm font-medium truncate">
                  {cvComponent.title}
                </h4>
                {!isExpanded && cvComponent.description && (
                  <p className="text-xs text-[#94a3b8] mt-1 line-clamp-1">
                    {cvComponent.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400">No matching component found in your CV</p>
            </div>
          )}

          {/* Reasoning (Expandable) */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between text-[#94a3b8] hover:text-white hover:bg-white/5 -mx-2"
            >
              <span className="text-xs">
                {isExpanded ? 'Hide' : 'Show'} reasoning
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {isExpanded && (
              <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <p className="text-sm text-[#94a3b8] leading-relaxed">{reasoning}</p>

                {cvComponent && cvComponent.highlights.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-[#94a3b8] mb-2 font-medium">Highlights:</p>
                    <ul className="space-y-1">
                      {cvComponent.highlights.slice(0, 3).map((highlight, i) => (
                        <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-2">
                          <span className="text-[#0ea5e9] mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {cvComponent && cvComponent.start_date && (
                  <div className="flex items-center gap-2 text-xs text-[#94a3b8] mt-2">
                    <span>
                      {cvComponent.start_date} - {cvComponent.end_date || 'Present'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

<style jsx global>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
