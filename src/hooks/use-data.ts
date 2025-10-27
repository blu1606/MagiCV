'use client'

/**
 * Client-side data fetching hook
 * Use this in client components to fetch data from API routes
 */

import { useState, useEffect } from 'react'

export interface ComponentData {
  id: string
  type: 'experience' | 'project' | 'education' | 'skill'
  title: string
  organization: string | null
  start_date: string | null
  end_date: string | null
  description: string | null
  highlights: string[]
  created_at?: string
}

export interface CVData {
  id: string
  title: string
  job_description: string | null
  match_score: number | null
  content: any
  created_at: string
}

/**
 * Hook to fetch components from API
 */
export function useComponents() {
  const [components, setComponents] = useState<ComponentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComponents() {
      try {
        console.log('🔔 useComponents - fetching /api/components')
        const response = await fetch('/api/components')
        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(`Failed to fetch components: ${response.status} ${response.statusText} ${text}`)
        }
        const data = await response.json()
        console.log('🔔 useComponents - received data, length:', Array.isArray(data) ? data.length : 'non-array')
        setComponents(data)
      } catch (err) {
        console.error('useComponents error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchComponents()
  }, [])

  return { components, loading, error, refetch: () => setLoading(true) }
}

/**
 * Hook to fetch CVs from API
 */
export function useCVs() {
  const [cvs, setCVs] = useState<CVData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCVs() {
      try {
        const response = await fetch('/api/cvs')
        if (!response.ok) throw new Error('Failed to fetch CVs')
        const data = await response.json()
        setCVs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCVs()
  }, [])

  return { cvs, loading, error, refetch: () => setLoading(true) }
}

/**
 * Hook to fetch dashboard stats
 */
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalComponents: 0,
    totalCVs: 0,
    experienceCount: 0,
    skillCount: 0,
    projectCount: 0,
    educationCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}
