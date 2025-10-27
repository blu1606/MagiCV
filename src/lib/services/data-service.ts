/**
 * Data Service Layer
 * Provides a unified interface for fetching data from Supabase or mockup
 * Toggle between real and mock data using environment variable
 */

import { createClient } from '@/lib/supabase/server'

// Check if we're in debug/mock mode
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

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

// Mock data (fallback)
const MOCK_COMPONENTS: ComponentData[] = [
  {
    id: 'mock-1',
    type: 'experience',
    title: 'Senior Frontend Developer',
    organization: 'Tech Corp',
    start_date: '2022-01-01',
    end_date: null,
    description: 'Leading frontend development',
    highlights: ['Built React apps', 'Mentored team', 'Improved performance'],
  },
  {
    id: 'mock-2',
    type: 'skill',
    title: 'React & Next.js',
    organization: null,
    start_date: null,
    end_date: null,
    description: 'Expert in React ecosystem',
    highlights: ['5+ years', '50+ apps', 'TypeScript'],
  },
]

const MOCK_CVS: CVData[] = [
  {
    id: 'mock-cv-1',
    title: 'CV for Full Stack Developer',
    job_description: 'Looking for full stack developer...',
    match_score: 92.5,
    content: { sections: [] },
    created_at: new Date().toISOString(),
  },
]

/**
 * Get all components for current user
 */
export async function getComponents(): Promise<ComponentData[]> {
  console.log('🔍 getComponents called - USE_MOCK_DATA:', USE_MOCK_DATA)
  
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK component data due to environment variable')
    return MOCK_COMPONENTS
  }

  try {
    console.log('🔗 Creating Supabase client...')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('👤 User status:', user ? `Authenticated (${user.email})` : 'Not authenticated')

    if (!user) {
      console.log('⚠️ No user authenticated, returning mock data')
      return MOCK_COMPONENTS
    }

    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching components:', error)
      return MOCK_COMPONENTS
    }

    console.log(`✅ Fetched ${data.length} real components`)
    return data as ComponentData[]
  } catch (error) {
    console.error('❌ Exception fetching components:', error)
    return MOCK_COMPONENTS
  }
}

/**
 * Get components by type
 */
export async function getComponentsByType(
  type: ComponentData['type']
): Promise<ComponentData[]> {
  const allComponents = await getComponents()
  return allComponents.filter((c) => c.type === type)
}

/**
 * Get all CVs for current user
 */
export async function getCVs(): Promise<CVData[]> {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK CV data')
    return MOCK_CVS
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('⚠️ No user, returning mock CVs')
      return MOCK_CVS
    }

    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching CVs:', error)
      return MOCK_CVS
    }

    console.log(`✅ Fetched ${data.length} real CVs`)
    return data as CVData[]
  } catch (error) {
    console.error('❌ Exception fetching CVs:', error)
    return MOCK_CVS
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  if (USE_MOCK_DATA) {
    return {
      id: 'mock-user',
      full_name: 'John Doe (Mock)',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mock',
      profession: 'Full Stack Developer',
    }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('❌ Exception fetching profile:', error)
    return null
  }
}

/**
 * Get statistics for dashboard
 */
export async function getDashboardStats() {
  const components = await getComponents()
  const cvs = await getCVs()

  return {
    totalComponents: components.length,
    totalCVs: cvs.length,
    experienceCount: components.filter((c) => c.type === 'experience').length,
    skillCount: components.filter((c) => c.type === 'skill').length,
    projectCount: components.filter((c) => c.type === 'project').length,
    educationCount: components.filter((c) => c.type === 'education').length,
  }
}



