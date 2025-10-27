"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Target, Sparkles, FileText, BarChart3, Brain } from "lucide-react"
import Link from "next/link"
import { LinkedInSignIn } from "@/components/linkedin-signin"

export function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden video-content-with-scroll">
      {/* Scattered pixelated elements */}
      <div className="pixel-scatter pixel-scatter-1">
        <div className="pixel-plus"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-2">
        <div className="pixel-x"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-3">
        <div className="pixel-plus"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-4">
        <div className="pixel-x"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-5">
        <div className="pixel-arrow"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-6">
        <div className="pixel-heart"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/20 sticky top-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="pixel-plus"></div>
            <span className="font-bold text-xl text-white transform -rotate-2">magiCV</span>
          </div>
          <LinkedInSignIn />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center px-8 sm:px-12 lg:px-16 relative">
        <div className="max-w-7xl text-left space-y-8 py-12">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              <span className="glitch-text" data-text="AI VIẾT CV GIÚP BẠN?">AI VIẾT CV GIÚP BẠN?</span>
            </h1>
            <h2 className="text-3xl sm:text-6xl font-bold tracking-tight text-white leading-tight relative">
              AI VIẾT CV GIÚP BẠN.
              <div className="absolute bottom-0 left-0 w-3/4 h-1 bg-white border-dashed border-t-2 border-white"></div>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl font-mono">
              From PiX.stdio | Da Nang, Vietnam
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <LinkedInSignIn />
            <Button variant="ghost" className="text-white font-mono text-lg hover:bg-white/10">
              Cancel
            </Button>
          </div>
        </div>

        {/* Additional pixelated elements */}
        <div className="absolute top-20 right-10 pixel-arrow"></div>
        <div className="absolute bottom-20 left-10 pixel-plus"></div>
        <div className="absolute top-1/2 right-5 pixel-x"></div>
      </section>

      {/* Features Section */}
      <section className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        {/* Background layer */}
        <div className="absolute inset-0 bg-[#ff5f94] opacity-100"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-black bg-transparent hover:border-gray-600 transition-colors relative">
              <FileText className="mx-auto mb-4 w-12 h-12 text-black" />
              <h3 className="font-bold mb-4 text-black text-xl">One-Click Generation</h3>
              <p className="text-black font-mono">Paste a job description and get a tailored CV instantly</p>
            </div>
            <div className="p-8 border-2 border-black bg-transparent hover:border-gray-600 transition-colors relative">
              <BarChart3 className="mx-auto mb-4 w-12 h-12 text-black" />
              <h3 className="font-bold mb-4 text-black text-xl">Match Score</h3>
              <p className="text-black font-mono">See how well your CV matches the job requirements</p>
            </div>
            <div className="p-8 border-2 border-black bg-transparent hover:border-gray-600 transition-colors relative">
              <Brain className="mx-auto mb-4 w-12 h-12 text-black" />
              <h3 className="font-bold mb-4 text-black text-xl">AI-Powered</h3>
              <p className="text-black font-mono">Powered by advanced AI to highlight your best qualities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-mono">
              Join thousands of professionals who have already created their perfect CV with magiCV
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <LinkedInSignIn />
          </div>
        </div>
      </section>
    </div>
  )
}
