'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CVEditorPage } from '@/components/cv-editor-page'
import type { JDMatchingResults } from '@/lib/types/jd-matching'
import { Loader2 } from 'lucide-react'

export default function EditorFromMatching() {
  const router = useRouter()
  const [matchingData, setMatchingData] = useState<JDMatchingResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load matching results from localStorage
    const stored = localStorage.getItem('jd-matching-editor-data')
    if (!stored) {
      // No data, redirect to JD matching
      router.push('/jd/match')
      return
    }

    try {
      const { matchingResults } = JSON.parse(stored)
      setMatchingData(matchingResults)
    } catch (error) {
      console.error('Failed to parse matching data:', error)
      router.push('/jd/match')
      return
    }

    setIsLoading(false)
  }, [router])

  if (isLoading || !matchingData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mx-auto" />
          <p className="text-white text-lg">Loading your matched components...</p>
        </div>
      </div>
    )
  }

  return <CVEditorPage cvId="from-matching" matchingResults={matchingData} />
}
