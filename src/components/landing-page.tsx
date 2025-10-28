"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Target, Sparkles, FileText, BarChart3, Brain, SparklesIcon } from "lucide-react"
import Link from "next/link"
import { LinkedInSignIn } from "@/components/linkedin-signin"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { MorphingText } from "@/components/ui/morphing-text"
import { Particles } from "@/components/ui/particles"
import { GridPattern } from "@/components/ui/grid-pattern"
import { BentoGrid } from "@/components/ui/bento-grid"
import { MagicCard } from "@/components/ui/magic-card"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedList } from "@/components/ui/animated-list"

export function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#0ea5e9"
        />
        <GridPattern
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-20"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
      </div>
      {/* Navigation */}
      <nav className="border-b border-white/10 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl text-white">magiCV</span>
          </div>
          <LinkedInSignIn />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center px-8 sm:px-12 lg:px-16 relative z-10">
        <div className="max-w-7xl text-left space-y-8 py-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <MorphingText 
                texts={[
                  "AI writes your CV",
                  "Tailored to the job",
                  "In under 10 seconds",
                  "Match score updates live"
                ]}
                className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight"
              />
              
              <div className="text-xl text-gray-400 font-mono">
                For digital nomads • Remote professionals • Career changers
              </div>
            </div>
            
            <AnimatedGradientText className="text-2xl">
              ✨ <span className="inline bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent">
                100% Free • No Watermarks • Tailored to Your Skills
              </span>
            </AnimatedGradientText>
            
            <p className="text-xl text-gray-300 max-w-2xl">
              Paste a job description. Get a perfectly tailored CV. 
              <span className="text-accent font-semibold"> Match scores update in real-time.</span>
            </p>
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap gap-8 pt-6">
            <div className="text-left">
              <div className="text-5xl font-bold text-white">
                <NumberTicker value={10000} />
              </div>
              <p className="text-sm text-gray-400">CVs Generated</p>
            </div>
            <div className="text-left">
              <div className="text-5xl font-bold text-white">
                <NumberTicker value={95} />%
              </div>
              <p className="text-sm text-gray-400">Avg Match Score</p>
            </div>
            <div className="text-left">
              <div className="text-5xl font-bold text-white">
                <NumberTicker value={8} />
                <span className="text-2xl">s</span>
              </div>
              <p className="text-sm text-gray-400">Avg Generation Time</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <LinkedInSignIn />
          </div>
        </div>
      </section>

      {/* Features Section - BentoGrid */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-12 text-center">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Three simple steps to your perfect CV
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1">
              <MagicCard gradientColor="#0ea5e9">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <FileText className="w-10 h-10 text-primary" />
                    <div className="text-3xl font-bold text-white">1</div>
                  </div>
                  <h3 className="font-bold mb-3 text-white text-2xl">
                    Paste Job Description
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Just paste the JD. Our AI analyzes keywords, skills, and requirements instantly.
                  </p>
                  <div className="mt-4 text-sm text-primary font-mono">
                    Avg: 2s • 100% Accurate
                  </div>
                </div>
                <BorderBeam className="rounded-lg" />
              </MagicCard>
            </div>

            <div className="col-span-1">
              <MagicCard gradientColor="#f97316">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <Zap className="w-10 h-10 text-accent" />
                    <div className="text-3xl font-bold text-white">2</div>
                  </div>
                  <h3 className="font-bold mb-3 text-white text-2xl">
                    AI Generates CV
                  </h3>
                  <p className="text-gray-300 mb-4">
                    AI creates a tailored CV matching your profile to the job description perfectly.
                  </p>
                  <div className="mt-4 text-sm text-accent font-mono">
                    &lt;10s • 98% Success Rate
                  </div>
                </div>
                <BorderBeam className="rounded-lg" />
              </MagicCard>
            </div>

            <div className="col-span-1">
              <MagicCard gradientColor="#22d3ee">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <BarChart3 className="w-10 h-10 text-cyan-400" />
                    <div className="text-3xl font-bold text-white">3</div>
                  </div>
                  <h3 className="font-bold mb-3 text-white text-2xl">
                    Edit & Match Score
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Drag & drop to customize. See real-time match score updates as you edit.
                  </p>
                  <div className="mt-4 text-sm text-cyan-400 font-mono">
                    Updates in &lt;500ms
                  </div>
                </div>
                <BorderBeam className="rounded-lg" />
              </MagicCard>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
              Ready to Get Started?
            </h2>
            <AnimatedGradientText className="text-xl">
              <span className="inline bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent">
                Join thousands of digital nomads who've created their perfect CV
              </span>
            </AnimatedGradientText>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <LinkedInSignIn />
          </div>
        </div>
      </section>
    </div>
  )
}
