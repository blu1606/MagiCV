import { DataSourcesPage } from "@/components/data-sources-page"
import { Suspense } from "react"

function DataSourcesPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataSourcesPage />
    </Suspense>
  )
}

export default function DataSourcesRoute() {
  return <DataSourcesPageWithSuspense />
}
