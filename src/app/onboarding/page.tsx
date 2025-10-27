import { OnboardingPage } from "@/components/onboarding-page"
import { Suspense } from "react"

function OnboardingPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingPage />
    </Suspense>
  )
}

export default function OnboardingRoute() {
  return <OnboardingPageWithSuspense />
}
