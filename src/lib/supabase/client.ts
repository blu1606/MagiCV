import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern for browser client to avoid multiple instances
let browserClient: SupabaseClient<Database> | null = null

export function createClient() {
  // Return existing client if available
  if (browserClient) {
    return browserClient
  }

  // Create new client only if it doesn't exist
  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

