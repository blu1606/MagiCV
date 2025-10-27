"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    fullName: "",
    profession: "",
    bio: "",
  })
  const router = useRouter()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      router.push("/dashboard")
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
              className="glitch-button text-black font-bold gap-2"
            >
              {step === 3 ? 'Complete Setup' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
