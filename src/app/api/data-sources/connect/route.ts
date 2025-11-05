import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/data-sources/connect
 * Initialize OAuth flow for connecting a data source
 */
export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider || !['github', 'linkedin', 'youtube'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be github, linkedin, or youtube' },
        { status: 400 }
      )
    }

    // Generate OAuth URLs based on provider
    let authUrl: string
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`

    switch (provider) {
      case 'github':
        const githubClientId = process.env.GITHUB_CLIENT_ID
        if (!githubClientId) {
          return NextResponse.json(
            { error: 'GitHub OAuth not configured' },
            { status: 500 }
          )
        }
        authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=read:user,repo`
        break

      case 'linkedin':
        const linkedinClientId = process.env.LINKEDIN_CLIENT_ID
        if (!linkedinClientId) {
          return NextResponse.json(
            { error: 'LinkedIn OAuth not configured' },
            { status: 500 }
          )
        }
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${redirectUri}&scope=r_liteprofile,r_emailaddress`
        break

      case 'youtube':
        const googleClientId = process.env.GOOGLE_CLIENT_ID
        if (!googleClientId) {
          return NextResponse.json(
            { error: 'Google OAuth not configured' },
            { status: 500 }
          )
        }
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly`
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      authUrl,
      provider,
    })
  } catch (error: any) {
    console.error('Error in data-sources/connect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
