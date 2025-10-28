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

      {/* Features Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-8 border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all relative group">
              <FileText className="mb-4 w-12 h-12 text-primary" />
              <h3 className="font-bold mb-4 text-white text-xl">One-Click Generation</h3>
              <p className="text-gray-300">Paste a job description and get a tailored CV in seconds</p>
              <div className="mt-4 text-sm text-primary">
                Avg: 8.5s • Success Rate: 98%
              </div>
            </div>
            <div className="p-8 border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all relative group">
              <BarChart3 className="mb-4 w-12 h-12 text-accent" />
              <h3 className="font-bold mb-4 text-white text-xl">Real-Time Match Score</h3>
              <p className="text-gray-300">See how well your CV matches job requirements</p>
              <div className="mt-4 text-sm text-accent">
                Updates in &lt;500ms
              </div>
            </div>
            <div className="p-8 border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all relative group">
              <Brain className="mb-4 w-12 h-12 text-purple-400" />
              <h3 className="font-bold mb-4 text-white text-xl">AI-Powered</h3>
              <p className="text-gray-300">Advanced AI highlights your best qualities</p>
              <div className="mt-4 text-sm text-purple-400">
                Powered by GPT-4
              </div>
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
