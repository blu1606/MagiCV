import { CVOptimizerPage } from "@/components/cv-optimizer-page"
import { Suspense } from "react"

function CVOptimizerPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CVOptimizerPage />
    </Suspense>
  )
}

export default function CVOptimizerRoute() {
  return <CVOptimizerPageWithSuspense />
}
