"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ChevronLeft, Zap, Star, Crown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { GridPattern } from "@/components/ui/grid-pattern"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { BorderBeam } from "@/components/ui/border-beam"
import { Particles } from "@/components/ui/particles"

interface Plan {
  id: string
  name: string
  price: number
  description: string
  icon: React.ReactNode
  features: string[]
  cta: string
  highlighted?: boolean
}

export function UpgradePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      icon: <Zap className="w-6 h-6" />,
      features: ["1 CV per month", "Basic templates", "Community support", "Match score analysis"],
      cta: "Current Plan",
    },
    {
      id: "pro",
      name: "Pro",
      price: 9.99,
      description: "For serious job seekers",
      icon: <Star className="w-6 h-6" />,
      features: [
        "Unlimited CVs",
        "Multiple versions per job",
        "Advanced AI suggestions",
        "Priority email support",
        "Custom templates",
        "Export to PDF & Word",
      ],
      cta: "Upgrade to Pro",
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 29.99,
      description: "For teams and professionals",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Advanced analytics",
        "24/7 priority support",
        "API access",
        "Custom branding",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
    },
  ]

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId)
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Successfully upgraded to ${plans.find((p) => p.id === planId)?.name} plan!`)
      setSelectedPlan(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern 
        className="absolute inset-0 opacity-10" 
        width={40} 
        height={40} 
        x={0}
        y={0}
        strokeDasharray="0"
      />
      
      {/* Particles Effect */}
      <Particles className="absolute inset-0 opacity-30" />
      {/* Header */}
      <div className="border-b border-white/20 backdrop-blur-sm sticky top-0 z-50 bg-[#0f172a]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10 border-white/20">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h1>
          <AnimatedGradientText className="text-xl max-w-2xl mx-auto">
            Choose the perfect plan to accelerate your job search and land your dream role
          </AnimatedGradientText>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 flex flex-col transition-all bg-[#0f172a]/80 backdrop-blur-sm border-white/20 relative ${
                plan.highlighted
                  ? "border-[#0ea5e9]/50 bg-[#0ea5e9]/5 ring-2 ring-[#0ea5e9]/20 md:scale-105"
                  : "hover:border-[#0ea5e9]/30"
              }`}
            >
              {plan.highlighted && (
                <>
                  <BorderBeam className="opacity-100" />
                  <Badge className="w-fit mb-4 bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white">Most Popular</Badge>
                </>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`${plan.highlighted ? 'text-[#0ea5e9]' : 'text-[#f97316]'}`}>{plan.icon}</div>
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              </div>

              <p className="text-gray-300 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-300">/month</span>}
                </div>
                {plan.price === 0 && <p className="text-sm text-gray-300 mt-1">Forever free</p>}
              </div>

              <ShimmerButton
                onClick={() => handleUpgrade(plan.id)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full mb-8 ${
                  plan.highlighted 
                    ? "bg-gradient-to-r from-[#0ea5e9] to-[#22d3ee] text-white" 
                    : "bg-[#f97316] text-white"
                }`}
              >
                {isProcessing && selectedPlan === plan.id ? "Processing..." : plan.cta}
              </ShimmerButton>

              <div className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-[#0ea5e9]' : 'text-[#f97316]'}`} />
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <h3 className="font-semibold mb-2 text-white">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-300">
                Yes, you can cancel your subscription at any time. No questions asked, no hidden fees.
              </p>
            </Card>
            <Card className="p-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <h3 className="font-semibold mb-2 text-white">Do you offer refunds?</h3>
              <p className="text-sm text-gray-300">
                We offer a 30-day money-back guarantee if you're not satisfied with your purchase.
              </p>
            </Card>
            <Card className="p-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <h3 className="font-semibold mb-2 text-white">Can I switch plans?</h3>
              <p className="text-sm text-gray-300">
                You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card className="p-6 bg-[#0f172a]/80 backdrop-blur-sm border-white/20">
              <h3 className="font-semibold mb-2 text-white">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-300">
                We accept all major credit cards, PayPal, and Apple Pay for your convenience.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
