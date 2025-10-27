"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    // TODO: Implement actual authentication
  }

  const handleLinkedInAuth = async () => {
    setIsLoading(true)
    try {
      // LinkedIn OAuth implementation
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
      const redirectUri = `${window.location.origin}/onboarding`
      const scope = 'r_liteprofile r_emailaddress'
      const state = Math.random().toString(36).substring(7)
      
      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`
      
      // Store state for verification
      localStorage.setItem('linkedin_state', state)
      
      // Redirect to LinkedIn
      window.location.href = linkedInAuthUrl
    } catch (error) {
      console.error('LinkedIn auth error:', error)
      setIsLoading(false)
      alert('LinkedIn authentication failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scattered pixelated elements */}
      <div className="pixel-scatter pixel-scatter-1">
        <div className="pixel-plus"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-2">
        <div className="pixel-x"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-3">
        <div className="pixel-arrow"></div>
      </div>

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-white hover:text-pink-400 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-mono">Back</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="glitch-text-box p-8 bg-white text-black">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="pixel-plus"></div>
            <span className="font-bold text-xl text-black transform -rotate-1">magiCV</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black font-mono">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            <p className="text-gray-600 text-sm font-mono">
              {isSignUp ? "Join magiCV to start creating optimized CVs" : "Sign in to your magiCV account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full glitch-button text-black font-bold" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-600 font-mono">Or</span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-transparent hover:bg-gray-100 hover:border-gray-400 text-black font-mono border-gray-300"
              onClick={() => handleLinkedInAuth()}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </Button>
            <Button variant="outline" className="w-full bg-transparent text-black font-mono border-gray-300 hover:bg-gray-100">
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full bg-transparent text-black font-mono border-gray-300 hover:bg-gray-100">
              Continue with GitHub
            </Button>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600 font-mono">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmail("")
                setPassword("")
                setConfirmPassword("")
                setFullName("")
              }}
              className="text-pink-500 hover:underline font-bold font-mono"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-6 font-mono">
            By continuing, you agree to our{" "}
            <a href="#" className="text-pink-500 hover:underline font-bold">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-pink-500 hover:underline font-bold">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
