"use client"

import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiService } from "@/lib/api-service"
import { errorHandler } from "@/lib/error-handler"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"syncing" | "success" | "error">("syncing")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const storedState = localStorage.getItem('linkedin_state')

        if (!code || !state || state !== storedState) {
          throw new Error('Invalid LinkedIn callback')
        }

        // Exchange code for access token and user data
        const { user, token } = await apiService.loginWithLinkedIn(code, state)
        
        // Store auth token
        localStorage.setItem('auth_token', token)
        localStorage.removeItem('linkedin_state')

        setStatus("success")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)

      } catch (error) {
        console.error('LinkedIn callback error:', error)
        const appError = errorHandler.handleAPIError(error)
        setErrorMessage(appError.message)
        setStatus("error")
      }
    }

    // Check if this is a LinkedIn callback
    if (searchParams.get('code')) {
      handleLinkedInCallback()
    } else {
      // Simulate data sync for demo
      const timer = setTimeout(() => {
        setStatus("success")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center p-4">
      {/* Grid Pattern Background */}
      <GridPattern 
        className="absolute inset-0 opacity-10" 
        width={40} 
        height={40} 
        x={0}
        y={0}
        strokeDasharray="0"
      />
      
      <Card className="w-full max-w-md p-8 text-center space-y-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20 relative z-10">
        <BorderBeam className="opacity-0 group-hover:opacity-100" />
        {status === "syncing" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-[#0ea5e9] mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Syncing your profile</h2>
              <AnimatedGradientText className="text-sm">
                We're pulling your data from LinkedIn...
              </AnimatedGradientText>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#22d3ee]/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-[#22d3ee]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">All set!</h2>
              <AnimatedGradientText className="text-sm">
                Your profile is ready. Redirecting...
              </AnimatedGradientText>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Sync failed</h2>
              <p className="text-sm text-gray-300">
                {errorMessage || "Please try again or contact support"}
              </p>
              <ShimmerButton 
                onClick={() => router.push("/auth")}
                className="bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white"
              >
                Try Again
              </ShimmerButton>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <OnboardingContent />
    </Suspense>
  )
}
