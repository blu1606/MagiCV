import { DataSourcesPage } from "@/components/pages/data-sources-page"
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
