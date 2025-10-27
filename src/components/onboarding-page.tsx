"use client"

import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiService } from "@/lib/api-service"
import { errorHandler } from "@/lib/error-handler"

export function OnboardingPage() {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6 bg-black/60 backdrop-blur-sm border-white/20">
        {status === "syncing" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-pink-400 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Syncing your profile</h2>
              <p className="text-sm text-gray-300">We're pulling your data from LinkedIn...</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-pink-400/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">All set!</h2>
              <p className="text-sm text-gray-300">Your profile is ready. Redirecting...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Sync failed</h2>
              <p className="text-sm text-gray-300">
                {errorMessage || "Please try again or contact support"}
              </p>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="text-pink-400 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
