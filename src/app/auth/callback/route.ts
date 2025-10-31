import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔐 Auth Callback - Code:', code ? 'Present' : 'Missing')
  console.log('🔐 Auth Callback - Error:', error || 'None')
  console.log('🔐 Auth Callback - Origin:', origin)
  console.log('🔐 Auth Callback - Next:', next)

  // Handle OAuth errors
  if (error) {
    console.error('❌ OAuth error:', error)
    console.error('❌ OAuth error description:', errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    console.error('❌ No code parameter in callback URL')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  try {
    const supabase = await createClient()
    console.log('🔐 Exchanging code for session...')
    
    // Exchange code for session - this handles PKCE flow state automatically
    const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('❌ Exchange code error:', exchangeError.message)
      console.error('❌ Error details:', exchangeError)
      
      // Handle specific error: flow state not found
      if (exchangeError.message?.includes('Flow state not found') || exchangeError.message?.includes('flow_state')) {
        console.error('❌ PKCE flow state error - redirecting to login')
        return NextResponse.redirect(`${origin}/login?error=flow_state_expired`)
      }
      
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`)
    }
    
    if (!session) {
      console.error('❌ No session after code exchange')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Error getting user:', userError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
    
    console.log('✅ User authenticated:', user.id)
    console.log('✅ Provider:', session.provider_token ? 'Has provider token' : 'No provider token')
    
    // Create profile if not exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.preferred_username || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || user.user_metadata?.avatar_url || null,
          profession: null
        } as any,
        { onConflict: 'id' }
      )
    
    if (profileError) {
      console.error('⚠️ Error creating/updating profile:', profileError)
      // Don't fail the auth flow if profile creation fails
    }

    // Save provider account and access token (for GitHub, LinkedIn, etc.)
    const providerToken = session.provider_token
    const providerRefreshToken = session.provider_refresh_token
    
    console.log('🔑 Has provider_token:', !!providerToken)
    console.log('🔑 Has provider_refresh_token:', !!providerRefreshToken)
    console.log('🔑 User app_metadata provider:', user.app_metadata?.provider)
    console.log('🔑 User user_metadata provider:', user.user_metadata?.provider)
    
    if (providerToken) {
      // Determine provider from user metadata or session
      // LinkedIn usually has refresh_token, GitHub may or may not
      let detectedProvider: 'github' | 'linkedin' = 'github'
      
      // Check user metadata first
      const userProvider = user.app_metadata?.provider || user.user_metadata?.provider
      if (userProvider === 'linkedin_oidc' || userProvider === 'linkedin') {
        detectedProvider = 'linkedin'
      } else if (userProvider === 'github') {
        detectedProvider = 'github'
      } else {
        // Fallback: LinkedIn usually has refresh_token in session
        // GitHub tokens might not always have refresh_token
        // This is a heuristic - in practice, check the actual provider from metadata
        detectedProvider = providerRefreshToken ? 'linkedin' : 'github'
      }
      
      // Calculate token expiry
      const expiresAt = new Date()
      // GitHub tokens don't expire, LinkedIn tokens typically last 60 days
      if (detectedProvider === 'linkedin') {
        expiresAt.setDate(expiresAt.getDate() + 60)
      } else {
        // GitHub tokens don't expire, set far future date
        expiresAt.setFullYear(expiresAt.getFullYear() + 10)
      }
      
      const { error: accountError } = await supabase
        .from('accounts')
        .upsert(
          {
            user_id: user.id,
            provider: detectedProvider,
            provider_account_id: user.user_metadata?.sub || user.user_metadata?.preferred_username || user.id,
            access_token: providerToken,
            refresh_token: providerRefreshToken || null,
            token_expires_at: expiresAt.toISOString(),
            scopes: detectedProvider === 'linkedin' ? ['openid', 'profile', 'email'] : ['user:email', 'read:user'],
            last_synced_at: new Date().toISOString()
          } as any,
          { onConflict: 'provider,provider_account_id' }
        )
      
      if (accountError) {
        console.error('⚠️ Error saving account:', accountError)
        // Don't fail the auth flow if account save fails
      } else {
        console.log(`✅ Saved ${detectedProvider} account and token`)
      }
    }
    
    // Build redirect URL
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    let redirectUrl: string
    if (isLocalEnv) {
      redirectUrl = `${origin}${next}`
    } else if (forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`
    } else {
      redirectUrl = `${origin}${next}`
    }
    
    console.log('✅ Redirecting to:', redirectUrl)
    
    // Create redirect response and ensure cookies are set
    const response = NextResponse.redirect(redirectUrl)
    
    return response
    
  } catch (error: any) {
    console.error('❌ Unexpected error in callback:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message || 'Unexpected error')}`)
  }
}
