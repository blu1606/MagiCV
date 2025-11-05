import { ComponentLibraryPage } from "@/components/component-library-page"
import { Suspense } from "react"

function ComponentLibraryPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComponentLibraryPage />
    </Suspense>
  )
}

export default function ComponentLibraryRoute() {
  return <ComponentLibraryPageWithSuspense />
}
