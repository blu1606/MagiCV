import { ProfessionSelectPage } from "@/components/pages/profession-select-page"
import { Suspense } from "react"

function ProfessionSelectPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfessionSelectPage />
    </Suspense>
  )
}

export default function ProfessionSelectRoute() {
  return <ProfessionSelectPageWithSuspense />
}
