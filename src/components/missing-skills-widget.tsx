'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Plus,
  TrendingUp,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface MissingSkillsWidgetProps {
  missingSkills?: string[]
  onAddSkill?: (skill: string) => void
  currentSkills?: string[]
  variant?: 'default' | 'compact'
  showRecommendations?: boolean
}

export function MissingSkillsWidget({
  missingSkills = [],
  onAddSkill,
  currentSkills = [],
  variant = 'default',
  showRecommendations = true,
}: MissingSkillsWidgetProps) {
  const { toast } = useToast()
  const [dismissedSkills, setDismissedSkills] = useState<Set<string>>(new Set())

  const visibleSkills = missingSkills.filter(
    (skill) => !dismissedSkills.has(skill) && !currentSkills.includes(skill)
  )

  const handleAddSkill = (skill: string) => {
    if (onAddSkill) {
      onAddSkill(skill)
      toast({
        title: 'Skill Added!',
        description: `"${skill}" has been added to your profile`,
      })
    }
  }

  const handleDismiss = (skill: string) => {
    setDismissedSkills(new Set([...dismissedSkills, skill]))
    toast({
      title: 'Skill Dismissed',
      description: `"${skill}" has been hidden from recommendations`,
    })
  }

  if (visibleSkills.length === 0) {
    return null
  }

  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-2">
              Missing Skills ({visibleSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {visibleSkills.slice(0, 5).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1 bg-orange-500/10 text-orange-300 border-orange-500/20 hover:bg-orange-500/20 cursor-pointer"
                  onClick={() => handleAddSkill(skill)}
                >
                  <Plus className="w-3 h-3" />
                  {skill}
                </Badge>
              ))}
              {visibleSkills.length > 5 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-500/10 text-orange-300 border-orange-500/20"
                >
                  +{visibleSkills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <AlertCircle className="w-6 h-6 text-orange-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Missing Skills Detected
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                These skills appear in the job description but not in your profile
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">
                {visibleSkills.length}
              </div>
              <div className="text-xs text-slate-400">skills</div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {visibleSkills.map((skill, index) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a]/60 border border-orange-500/20 group hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-500">
                        #{index + 1}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onAddSkill && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSkill(skill)}
                        className="gap-1 text-green-400 hover:text-green-300 hover:bg-green-400/10 h-8 px-2"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="text-xs">Add</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(skill)}
                      className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {showRecommendations && visibleSkills.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-[#22d3ee]/10 border border-[#22d3ee]/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Recommendations
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                      <span>
                        Add these skills to your profile to increase match score by{' '}
                        <strong className="text-white">
                          {Math.min(visibleSkills.length * 2, 15)}%
                        </strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                      <span>
                        Focus on the top {Math.min(5, visibleSkills.length)}{' '}
                        skills first for maximum impact
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                      <span>
                        Consider adding relevant experience or projects demonstrating
                        these skills
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {visibleSkills.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Skills Coverage</span>
                  <span>
                    {currentSkills.length} /{' '}
                    {currentSkills.length + visibleSkills.length}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{
                      width: `${
                        (currentSkills.length /
                          (currentSkills.length + visibleSkills.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
