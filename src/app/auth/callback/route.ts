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
    
    // Check for provider in multiple places
    const appMetadataProvider = user.app_metadata?.provider
    const userMetadataProvider = user.user_metadata?.provider
    const providersList = user.app_metadata?.providers || []
    
    console.log('🔑 Has provider_token:', !!providerToken)
    console.log('🔑 Has provider_refresh_token:', !!providerRefreshToken)
    console.log('🔑 User app_metadata provider:', appMetadataProvider)
    console.log('🔑 User app_metadata providers:', providersList)
    console.log('🔑 User user_metadata provider:', userMetadataProvider)
    console.log('🔑 Session user id:', user.id)
    console.log('🔑 Session user email:', user.email)
    
    // Determine provider - check multiple sources
    let detectedProvider: 'github' | 'linkedin' | null = null
    
    // Priority 1: Check app_metadata provider (most reliable)
    if (appMetadataProvider) {
      if (appMetadataProvider === 'github') {
        detectedProvider = 'github'
      } else if (appMetadataProvider === 'linkedin_oidc' || appMetadataProvider === 'linkedin') {
        detectedProvider = 'linkedin'
      }
    }
    
    // Priority 2: Check providers list
    if (!detectedProvider && Array.isArray(providersList) && providersList.length > 0) {
      const lastProvider = providersList[providersList.length - 1]
      if (lastProvider === 'github') {
        detectedProvider = 'github'
      } else if (lastProvider === 'linkedin_oidc' || lastProvider === 'linkedin') {
        detectedProvider = 'linkedin'
      }
    }
    
    // Priority 3: Check user_metadata
    if (!detectedProvider && userMetadataProvider) {
      if (userMetadataProvider === 'github') {
        detectedProvider = 'github'
      } else if (userMetadataProvider === 'linkedin_oidc' || userMetadataProvider === 'linkedin') {
        detectedProvider = 'linkedin'
      }
    }
    
    console.log('🔍 Detected provider:', detectedProvider || 'UNKNOWN')
    
    // Only save if we have provider_token OR if we detected a provider
    // If no provider_token but provider detected, still save (token might not be available)
    if (providerToken || detectedProvider) {
      // If no provider detected but have token, try to infer from token presence
      // LinkedIn usually has refresh_token, GitHub may not
      if (!detectedProvider) {
        console.warn('⚠️ No provider detected from metadata, inferring from token presence')
        detectedProvider = providerRefreshToken ? 'linkedin' : 'github'
      }
      
      // Get provider account ID from user metadata
      // GitHub uses preferred_username or user_name, LinkedIn uses sub
      const providerAccountId = detectedProvider === 'github' 
        ? (user.user_metadata?.preferred_username || user.user_metadata?.user_name || user.user_metadata?.login || user.id)
        : (user.user_metadata?.sub || user.id)
      
      console.log('🔑 Provider account ID:', providerAccountId)
      
      // Calculate token expiry
      const expiresAt = new Date()
      // GitHub tokens don't expire, LinkedIn tokens typically last 60 days
      if (detectedProvider === 'linkedin') {
        expiresAt.setDate(expiresAt.getDate() + 60)
      } else {
        // GitHub tokens don't expire, set far future date
        expiresAt.setFullYear(expiresAt.getFullYear() + 10)
      }
      
      const accountData = {
        user_id: user.id,
        provider: detectedProvider,
        provider_account_id: providerAccountId,
        access_token: providerToken || null, // Allow null if no token
        refresh_token: providerRefreshToken || null,
        token_expires_at: expiresAt.toISOString(),
        scopes: detectedProvider === 'linkedin' ? ['openid', 'profile', 'email'] : ['user:email', 'read:user'],
        last_synced_at: new Date().toISOString()
      }
      
      console.log('💾 Saving account:', {
        provider: accountData.provider,
        provider_account_id: accountData.provider_account_id,
        has_access_token: !!accountData.access_token,
        has_refresh_token: !!accountData.refresh_token
      })
      
      const { error: accountError } = await supabase
        .from('accounts')
        .upsert(
          accountData as any,
          { onConflict: 'provider,provider_account_id' }
        )
      
      if (accountError) {
        console.error('⚠️ Error saving account:', accountError)
        console.error('⚠️ Account data:', accountData)
        // Don't fail the auth flow if account save fails
      } else {
        console.log(`✅ Saved ${detectedProvider} account and token to database`)
      }
    } else {
      console.warn('⚠️ No provider_token and no provider detected - account not saved')
      console.warn('⚠️ This might mean OAuth flow did not complete properly')
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
