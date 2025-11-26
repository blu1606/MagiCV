'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchScoreOptimizer } from '@/components/match-score-optimizer'
import { AIRephrase } from '@/components/ai-rephrase'
import { Card } from '@/components/ui/card'
import {
  Target,
  Wand2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export function CVOptimizerPage() {
  const [userId, setUserId] = useState('test-user-id') // Replace with actual user ID from auth

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20">
              <Sparkles className="w-6 h-6 text-[#0ea5e9]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              CV Optimizer
            </h1>
          </div>
          <p className="text-slate-400 text-base md:text-lg">
            Use AI to optimize your CV match score and improve your content
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#0ea5e9]/10 to-[#22d3ee]/10 border-[#0ea5e9]/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-8 h-8 text-[#0ea5e9]" />
              <h3 className="text-lg font-semibold text-white">Match Scoring</h3>
            </div>
            <p className="text-sm text-slate-400">
              Real-time CV-to-job compatibility analysis with weighted scoring and missing skills detection
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-[#f97316]/10 to-yellow-500/10 border-[#f97316]/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Wand2 className="w-8 h-8 text-[#f97316]" />
              <h3 className="text-lg font-semibold text-white">AI Rephrasing</h3>
            </div>
            <p className="text-sm text-slate-400">
              Improve your content with 5 AI modes: Professional, Concise, Impactful, Quantified, Action-Oriented
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-semibold text-white">Smart Cache</h3>
            </div>
            <p className="text-sm text-slate-400">
              Lightning-fast results with intelligent caching (90%+ hit rate, &lt;5ms response time)
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="match-score" className="space-y-6">
          <TabsList className="bg-[#0f172a]/80 border border-white/10 p-1">
            <TabsTrigger
              value="match-score"
              className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Match Score
            </TabsTrigger>
            <TabsTrigger
              value="rephrase"
              className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Rephrase
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="match-score" className="space-y-6">
            <MatchScoreOptimizer userId={userId} />
          </TabsContent>

          <TabsContent value="rephrase" className="space-y-6">
            <AIRephrase showComparison={true} />
          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <Card className="bg-[#0f172a]/80 backdrop-blur-sm border-white/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recommended Workflow
              </h2>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#0ea5e9]" />
                      Analyze Match Score
                    </h3>
                    <p className="text-slate-400 mb-2">
                      Paste the job description and get your match score with detailed breakdown
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                      <li>See which areas need improvement (experience, skills, education, projects)</li>
                      <li>Identify missing skills mentioned in the job description</li>
                      <li>Get personalized suggestions for improvement</li>
                    </ul>
                  </div>
                </div>

                <div className="border-l-2 border-[#0ea5e9] ml-5 h-8" />

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-[#f97316]" />
                      Improve Content with AI
                    </h3>
                    <p className="text-slate-400 mb-2">
                      Use AI rephrasing to enhance your CV bullets and descriptions
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                      <li>Choose mode based on needs (Quantified for metrics, Action-Oriented for stronger verbs)</li>
                      <li>Apply job context to tailor content</li>
                      <li>Review improvements and apply changes</li>
                    </ul>
                  </div>
                </div>

                <div className="border-l-2 border-[#0ea5e9] ml-5 h-8" />

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Re-analyze & Iterate
                    </h3>
                    <p className="text-slate-400 mb-2">
                      Check your new match score and continue improving
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                      <li>See how your improvements increased the match score</li>
                      <li>Address remaining gaps or missing skills</li>
                      <li>Repeat until you achieve 85%+ match score</li>
                    </ul>
                  </div>
                </div>

                <div className="border-l-2 border-[#0ea5e9] ml-5 h-8" />

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#22d3ee] text-white flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#22d3ee]" />
                      Generate Final CV
                    </h3>
                    <p className="text-slate-400 mb-2">
                      Create your optimized CV with the improved content
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1">
                      <li>Use the CV generator with your optimized components</li>
                      <li>Export to professional PDF format</li>
                      <li>Apply to jobs with confidence!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <Card className="mt-8 bg-gradient-to-br from-[#0ea5e9]/10 to-[#22d3ee]/10 border-[#0ea5e9]/20 p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#22d3ee]" />
                  Pro Tips
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    Use <strong className="text-white">Quantified mode</strong> when the job description emphasizes metrics and results
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    Apply <strong className="text-white">Action-Oriented mode</strong> to replace weak verbs with powerful action words
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    Aim for <strong className="text-white">85%+ match score</strong> for best chances with ATS systems
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22d3ee] flex-shrink-0 mt-0.5" />
                    Cache expires after 5 minutes - re-analyze if you make significant changes
                  </li>
                </ul>
              </Card>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
