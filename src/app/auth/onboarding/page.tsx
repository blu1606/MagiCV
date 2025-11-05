"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    fullName: "",
    profession: "",
    bio: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Complete onboarding - save profile data
      setIsSaving(true)

      try {
        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: profile.fullName,
            profession: profile.profession,
            bio: profile.bio,
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save profile')
        }

        toast({
          title: 'Profile Saved!',
          description: 'Welcome to MagiCV. Your profile has been created.',
        })

        router.push("/dashboard")
      } catch (error: any) {
        console.error('Error saving profile:', error)
        toast({
          variant: 'destructive',
          title: 'Save Failed',
          description: error.message || 'Failed to save your profile. Please try again.',
        })
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Scattered pixelated elements */}
      <div className="pixel-scatter pixel-scatter-1">
        <div className="pixel-plus"></div>
      </div>
      <div className="pixel-scatter pixel-scatter-2">
        <div className="pixel-x"></div>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <Card className="p-8 bg-black/60 backdrop-blur-sm border-2 border-white">
          <div className="text-center mb-8">
            <div className="pixel-plus mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-white mb-2 font-mono">Welcome to magiCV!</h1>
            <p className="text-gray-300 font-mono">Let's set up your profile to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                    step >= stepNumber 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-pink-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white font-mono">What's your name?</h2>
                <Input
                  placeholder="Enter your full name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="font-mono"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white font-mono">What's your profession?</h2>
                <Input
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="font-mono"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white font-mono">Tell us about yourself</h2>
                <Textarea
                  placeholder="Write a brief bio about your experience and skills..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="min-h-32 font-mono"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white font-mono"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="glitch-button text-black font-bold gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {step === 3 ? 'Complete Setup' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
