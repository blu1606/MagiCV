'use client'

import { useState } from 'react'
import {
  Code,
  Users,
  TrendingUp,
  Lightbulb,
  Scale,
  CheckCircle2,
  Sparkles,
  Trophy,
  Download,
  Eye,
  ChevronRight,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CVVariant, FocusArea } from '@/services/cv-variant-generator-service'

interface CVVariantSelectorProps {
  variants: CVVariant[]
  recommended: CVVariant
  comparison: Array<{
    variant: CVVariant
    rank: number
    prosAndCons: {
      pros: string[]
      cons: string[]
    }
  }>
  onSelectVariant: (variant: CVVariant) => void
  onDownloadVariant: (variant: CVVariant) => void
  onPreviewVariant: (variant: CVVariant) => void
}

const focusAreaIcons: Record<FocusArea, any> = {
  technical: Code,
  leadership: Users,
  impact: TrendingUp,
  innovation: Lightbulb,
  balanced: Scale,
}

const focusAreaColors: Record<FocusArea, string> = {
  technical: 'from-blue-500 to-cyan-500',
  leadership: 'from-purple-500 to-pink-500',
  impact: 'from-green-500 to-emerald-500',
  innovation: 'from-orange-500 to-yellow-500',
  balanced: 'from-gray-500 to-slate-500',
}

export function CVVariantSelector({
  variants,
  recommended,
  comparison,
  onSelectVariant,
  onDownloadVariant,
  onPreviewVariant,
}: CVVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<CVVariant>(recommended)

  const handleSelectVariant = (variant: CVVariant) => {
    setSelectedVariant(variant)
    onSelectVariant(variant)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30'
    if (score >= 60) return 'bg-blue-500/10 border-blue-500/30'
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
          <h2 className="text-3xl font-bold text-white">Choose Your Best CV Variant</h2>
        </div>
        <p className="text-[#94a3b8] text-lg max-w-3xl mx-auto">
          We generated {variants.length} optimized CV variants with different focus areas.
          Select the one that best matches your goals.
        </p>
      </div>

      {/* Recommended Badge */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-medium">
              Recommended: <span className="text-yellow-400">{recommended.title}</span> (Score: {recommended.score}/100)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Variant Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => {
          const Icon = focusAreaIcons[variant.focusArea]
          const isSelected = selectedVariant.id === variant.id
          const isRecommended = recommended.id === variant.id
          const comparisonData = comparison.find(c => c.variant.id === variant.id)

          return (
            <Card
              key={variant.id}
              className={`
                relative backdrop-blur-sm transition-all cursor-pointer
                ${isSelected
                  ? 'bg-[#0ea5e9]/20 border-[#0ea5e9] ring-2 ring-[#0ea5e9]'
                  : 'bg-[#0f172a]/80 border-white/10 hover:border-[#0ea5e9]/50'
                }
              `}
              onClick={() => handleSelectVariant(variant)}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-black">
                    <Star className="w-3 h-3 mr-1 fill-black" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader>
                {/* Icon with gradient */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${focusAreaColors[variant.focusArea]} p-2 mb-3`}>
                  <Icon className="w-full h-full text-white" />
                </div>

                <CardTitle className="text-white flex items-center justify-between">
                  {variant.title}
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0ea5e9]" />}
                </CardTitle>

                <CardDescription className="text-[#94a3b8]">
                  {variant.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Score */}
                <div className={`p-3 rounded-lg border ${getScoreBgColor(variant.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#94a3b8] text-sm">Match Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(variant.score)}`}>
                      {variant.score}
                    </span>
                  </div>
                  <Progress value={variant.score} className="h-2" />
                </div>

                {/* Rank */}
                {comparisonData && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94a3b8]">Ranking</span>
                    <Badge variant="outline" className="border-white/20 text-white">
                      #{comparisonData.rank} of {variants.length}
                    </Badge>
                  </div>
                )}

                {/* Component Counts */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#94a3b8]">
                  <div>
                    <span className="font-medium text-white">{variant.selectedComponents.experience.length}</span> Experiences
                  </div>
                  <div>
                    <span className="font-medium text-white">{variant.selectedComponents.skills.length}</span> Skills
                  </div>
                  <div>
                    <span className="font-medium text-white">{variant.selectedComponents.education.length}</span> Education
                  </div>
                  <div>
                    <span className="font-medium text-white">{variant.selectedComponents.projects.length}</span> Projects
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreviewVariant(variant)
                    }}
                    className="flex-1 border-white/20 hover:bg-white/10 text-white"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownloadVariant(variant)
                    }}
                    className="flex-1 bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Variant Details */}
      {selectedVariant && (
        <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0ea5e9]" />
              {selectedVariant.title} - Detailed View
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="bg-[#1e293b]">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="strengths">Strengths & Weaknesses</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="reasoning">AI Reasoning</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-[#1e293b] border border-white/10">
                  <h4 className="text-white font-medium mb-2">Professional Summary</h4>
                  <p className="text-[#94a3b8] leading-relaxed">
                    {selectedVariant.professionalSummary}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="strengths" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Strength Areas
                    </h4>
                    <ul className="space-y-2">
                      {selectedVariant.strengthAreas.map((strength, i) => (
                        <li key={i} className="text-[#94a3b8] text-sm flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <h4 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {selectedVariant.weaknessAreas.length > 0 ? (
                        selectedVariant.weaknessAreas.map((weakness, i) => (
                          <li key={i} className="text-[#94a3b8] text-sm flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))
                      ) : (
                        <li className="text-[#94a3b8] text-sm">No major weaknesses identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="components" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Experiences */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">
                      Experiences ({selectedVariant.selectedComponents.experience.length})
                    </h4>
                    {selectedVariant.selectedComponents.experience.map((exp) => (
                      <div key={exp.id} className="p-3 rounded-lg bg-[#1e293b] border border-white/10">
                        <p className="text-white font-medium text-sm">{exp.title}</p>
                        <p className="text-[#94a3b8] text-xs">{exp.organization}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">
                      Skills ({selectedVariant.selectedComponents.skills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVariant.selectedComponents.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="border-[#0ea5e9]/50 text-[#0ea5e9]">
                          {skill.title}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">
                      Education ({selectedVariant.selectedComponents.education.length})
                    </h4>
                    {selectedVariant.selectedComponents.education.map((edu) => (
                      <div key={edu.id} className="p-3 rounded-lg bg-[#1e293b] border border-white/10">
                        <p className="text-white font-medium text-sm">{edu.title}</p>
                        <p className="text-[#94a3b8] text-xs">{edu.organization}</p>
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">
                      Projects ({selectedVariant.selectedComponents.projects.length})
                    </h4>
                    {selectedVariant.selectedComponents.projects.map((proj) => (
                      <div key={proj.id} className="p-3 rounded-lg bg-[#1e293b] border border-white/10">
                        <p className="text-white font-medium text-sm">{proj.title}</p>
                        <p className="text-[#94a3b8] text-xs line-clamp-2">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reasoning" className="mt-4">
                <div className="p-4 rounded-lg bg-[#1e293b] border border-white/10">
                  <h4 className="text-white font-medium mb-2">AI Analysis</h4>
                  <p className="text-[#94a3b8] leading-relaxed">
                    {selectedVariant.reasoning}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
