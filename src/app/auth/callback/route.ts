import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/auth/onboarding'

  console.log('🔐 Auth Callback - Code:', code ? 'Present' : 'Missing')
  console.log('🔐 Auth Callback - Origin:', origin)
  console.log('🔐 Auth Callback - Next:', next)

  if (code) {
    const supabase = await createClient()
    console.log('🔐 Exchanging code for session...')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Exchange code error:', error.message)
      console.error('❌ Error details:', error)
    }
    
    if (!error) {
      // Get user data and session
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (user && session) {
        // Create profile if not exists
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              profession: null
            } as any,
            { onConflict: 'id' }
          )
        
        if (profileError) {
          console.error('Error creating profile:', profileError)
        }

        // Save LinkedIn account and access token
        const providerToken = session.provider_token
        const providerRefreshToken = session.provider_refresh_token
        
        console.log('🔑 Has provider_token:', !!providerToken)
        console.log('🔑 Has provider_refresh_token:', !!providerRefreshToken)
        
        if (providerToken) {
          // Calculate token expiry (LinkedIn tokens typically last 60 days)
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 60)
          
          const { error: accountError } = await supabase
            .from('accounts')
            .upsert(
              {
                user_id: user.id,
                provider: 'linkedin',
                provider_account_id: user.user_metadata?.sub || user.id,
                access_token: providerToken,
                refresh_token: providerRefreshToken || null,
                token_expires_at: expiresAt.toISOString(),
                scopes: ['openid', 'profile', 'email'],
                last_synced_at: new Date().toISOString()
              } as any,
              { onConflict: 'provider,provider_account_id' }
            )
          
          if (accountError) {
            console.error('❌ Error saving account:', accountError)
          } else {
            console.log('✅ Saved LinkedIn account and token')
          }
        } else {
          console.warn('⚠️ No provider_token in session - token not saved')
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('❌ Code exchange failed, redirecting to error page')
    }
  } else {
    console.error('❌ No code parameter in callback URL')
  }

  // Return the user to an error page with instructions
  console.log('❌ Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
