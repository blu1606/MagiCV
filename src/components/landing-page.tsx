"use client"

import { Button } from "@/components/ui/button"
import { Zap, Target, FileText, BarChart3 } from "lucide-react"
import { NumberTicker } from "@/components/ui/number-ticker"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { Particles } from "@/components/ui/particles"
import { GridPattern } from "@/components/ui/grid-pattern"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import { Globe } from "@/components/ui/globe"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { cn } from "@/lib/utils"
import { Glow } from "./ui/glow"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"

export function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#0ea5e9"
        />
        <GridPattern
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-10"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section - HeroGeometric Component */}
      <div className="relative z-10">
        <HeroGeometric
          badge="Digital Nomad CV Builder"
          title1="Build Your Perfect"
          title2="Digital Nomad CV"
          ctaButtons={
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] hover:from-[#0ea5e9]/80 hover:to-[#22d3ee]/80 text-white font-semibold px-10 py-5 text-xl"
                asChild
              >
                <a href="/login">Get Started Free</a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold px-10 py-5 text-xl"
                asChild
              >
                <a href="#demo">Watch Demo</a>
              </Button>
            </div>
          }
        />
      </div>

        {/* Features Section - How It Works */}
        <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-300">
                Four simple steps to your perfect CV
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="relative h-[280px] rounded-[1.25rem] border-[0.75px] border-white/10 p-4">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative h-full flex flex-col justify-center gap-4 rounded-xl border-[0.75px] bg-[#0f172a]/80 backdrop-blur-sm p-8 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-fit rounded-lg border-[0.75px] border-[#0ea5e9]/20 bg-[#0ea5e9]/10 p-2">
                      <FileText className="h-6 w-6 text-[#0ea5e9]" />
                    </div>
                    <div className="text-3xl font-bold text-[#0ea5e9]">1</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      Paste Job Description
                    </h3>
                    <p className="text-base text-gray-300">
                      Just paste the JD. Our AI analyzes keywords, skills, and requirements instantly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[280px] rounded-[1.25rem] border-[0.75px] border-white/10 p-4">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative h-full flex flex-col justify-center gap-4 rounded-xl border-[0.75px] bg-[#0f172a]/80 backdrop-blur-sm p-8 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-fit rounded-lg border-[0.75px] border-[#f97316]/20 bg-[#f97316]/10 p-2">
                      <Zap className="h-6 w-6 text-[#f97316]" />
                    </div>
                    <div className="text-3xl font-bold text-[#f97316]">2</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      AI Generates CV
                    </h3>
                    <p className="text-base text-gray-300">
                      AI creates a tailored CV matching your profile to the job description perfectly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[280px] rounded-[1.25rem] border-[0.75px] border-white/10 p-4">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative h-full flex flex-col justify-center gap-4 rounded-xl border-[0.75px] bg-[#0f172a]/80 backdrop-blur-sm p-8 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-fit rounded-lg border-[0.75px] border-[#22d3ee]/20 bg-[#22d3ee]/10 p-2">
                      <BarChart3 className="h-6 w-6 text-[#22d3ee]" />
                    </div>
                    <div className="text-3xl font-bold text-[#22d3ee]">3</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      Edit & Match Score
                    </h3>
                    <p className="text-base text-gray-300">
                      Drag & drop to customize. See real-time match score updates as you edit.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-[280px] rounded-[1.25rem] border-[0.75px] border-white/10 p-4">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                />
                <div className="relative h-full flex flex-col justify-center gap-4 rounded-xl border-[0.75px] bg-[#0f172a]/80 backdrop-blur-sm p-8 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-fit rounded-lg border-[0.75px] border-[#f97316]/20 bg-[#f97316]/10 p-2">
                      <Target className="h-6 w-6 text-[#f97316]" />
                    </div>
                    <div className="text-3xl font-bold text-[#f97316]">4</div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">
                      Real-Time Optimization
                    </h3>
                    <p className="text-base text-gray-300">
                      Get instant feedback and suggestions to improve your CV's match score as you edit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Built for Digital Nomads Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-16 text-center">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Built for Digital Nomads
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of remote professionals worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* AI Technology */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-12">AI-Powered Technology</h3>
              <div className="relative h-[25rem] w-full flex items-center justify-center">
              <OrbitingCircles
                  className="h-full w-full"
                duration={20}
                delay={20}
                  radius={80}
              >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#0ea5e9]/30 bg-[#0ea5e9]/10 backdrop-blur-sm shadow-lg shadow-[#0ea5e9]/20">
                    <FileText className="h-10 w-10 text-[#0ea5e9]" />
                </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#f97316]/30 bg-[#f97316]/10 backdrop-blur-sm shadow-lg shadow-[#f97316]/20">
                    <Zap className="h-10 w-10 text-[#f97316]" />
                </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#22d3ee]/30 bg-[#22d3ee]/10 backdrop-blur-sm shadow-lg shadow-[#22d3ee]/20">
                    <Target className="h-10 w-10 text-[#22d3ee]" />
                </div>
              </OrbitingCircles>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <span className="px-4 py-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 rounded-full text-[#0ea5e9] text-sm font-mono">AI-Powered</span>
                <span className="px-4 py-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full text-[#f97316] text-sm font-mono">Real-time</span>
                <span className="px-4 py-2 bg-[#22d3ee]/10 border border-[#22d3ee]/20 rounded-full text-[#22d3ee] text-sm font-mono">Secure</span>
              </div>
            </div>

            {/* Global Reach */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-12">Global Community</h3>
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 to-[#f97316]/20 rounded-full blur-3xl"></div>
                  <Globe className="w-full h-full relative z-10" />
                </div>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-[#0ea5e9]/5 rounded-lg border border-[#0ea5e9]/20 hover:bg-[#0ea5e9]/10 transition-all">
                    <div className="text-3xl sm:text-4xl font-bold text-[#0ea5e9] mb-2">
                      <NumberTicker value={50} />+
                    </div>
                    <p className="text-gray-300 font-medium text-sm sm:text-base">Countries</p>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-[#f97316]/5 rounded-lg border border-[#f97316]/20 hover:bg-[#f97316]/10 transition-all">
                    <div className="text-3xl sm:text-4xl font-bold text-[#f97316] mb-2">
                      <NumberTicker value={5000} />+
                    </div>
                    <p className="text-gray-300 font-medium text-sm sm:text-base">Digital Nomads</p>
                  </div>
                </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-8">
            <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
              Ready to Get Started?
            </h2>
            <AnimatedGradientText className="text-xl">
              <span className="inline bg-gradient-to-r from-[#f97316] to-[#0ea5e9] bg-clip-text text-transparent">
                Join thousands of digital nomads who've created their perfect CV
              </span>
            </AnimatedGradientText>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Start building your tailored CV in under 10 seconds. No watermarks, no hidden fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Button size="lg" className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white font-semibold px-12 py-4 text-lg" asChild>
              <a href="/login">Get Started Free</a>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 hover:border-white/50 bg-transparent px-12 py-4 text-lg" asChild>
              <a href="#demo">Learn More</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

