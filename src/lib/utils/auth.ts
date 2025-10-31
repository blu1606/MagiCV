import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Check if user is authenticated with valid session (client-side)
 * Returns { user, session, isAuthenticated }
 */
export async function checkAuthClient() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  const isAuthenticated = !!(user && session)

  // If user exists but no session, clear invalid state
  if (user && !session) {
    console.warn('⚠️ User found but no valid session - clearing invalid session')
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // Ignore sign out errors
    }
  }

  return {
    user: isAuthenticated ? user : null,
    session: isAuthenticated ? session : null,
    isAuthenticated,
    error: userError || sessionError || null
  }
}

/**
 * Check if user is authenticated with valid session (server-side)
 * Returns { user, session, isAuthenticated }
 */
export async function checkAuthServer() {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  const isAuthenticated = !!(user && session)

  // If user exists but no session, clear invalid state
  if (user && !session) {
    console.warn('⚠️ User found but no valid session - clearing invalid session')
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // Ignore sign out errors
    }
  }

  return {
    user: isAuthenticated ? user : null,
    session: isAuthenticated ? session : null,
    isAuthenticated,
    error: userError || sessionError || null
  }
}

