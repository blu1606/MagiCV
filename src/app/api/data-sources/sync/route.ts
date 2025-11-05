import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * POST /api/data-sources/sync
 * Trigger sync for a specific data source (GitHub, LinkedIn, YouTube)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { provider } = await request.json()

    if (!provider || !['github', 'linkedin', 'youtube'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be github, linkedin, or youtube' },
        { status: 400 }
      )
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get account for this provider
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: `No ${provider} account connected` },
        { status: 404 }
      )
    }

    // Check if token is still valid
    if (account.token_expires_at) {
      const expiresAt = new Date(account.token_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Access token expired. Please reconnect your account.' },
          { status: 401 }
        )
      }
    }

    // Trigger sync based on provider
    // In production, this would call the actual crawler APIs
    // For now, we'll update the last_synced_at timestamp

    let syncResult: any

    try {
      switch (provider) {
        case 'github':
          // Call GitHub crawler
          syncResult = await syncGitHub(user.id, account.access_token!)
          break
        case 'linkedin':
          // Call LinkedIn crawler
          syncResult = await syncLinkedIn(user.id, account.access_token!)
          break
        case 'youtube':
          // Call YouTube crawler
          syncResult = await syncYouTube(user.id, account.access_token!)
          break
      }
    } catch (syncError: any) {
      console.error(`Error syncing ${provider}:`, syncError)
      return NextResponse.json(
        { error: `Failed to sync ${provider}: ${syncError.message}` },
        { status: 500 }
      )
    }

    // Update last_synced_at
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', account.id)

    if (updateError) {
      console.error('Error updating last_synced_at:', updateError)
    }

    return NextResponse.json({
      success: true,
      provider,
      componentsImported: syncResult?.count || 0,
      lastSynced: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in data-sources/sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Sync GitHub data
 */
async function syncGitHub(userId: string, accessToken: string) {
  // Call the existing GitHub crawler API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crawl/github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('GitHub sync failed')
  }

  const data = await response.json()
  return { count: data.components?.length || 0 }
}

/**
 * Sync LinkedIn data
 */
async function syncLinkedIn(userId: string, accessToken: string) {
  // Call the existing LinkedIn crawler API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crawl/linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('LinkedIn sync failed')
  }

  const data = await response.json()
  return { count: data.components?.length || 0 }
}

/**
 * Sync YouTube data
 */
async function syncYouTube(userId: string, accessToken: string) {
  // Call the existing YouTube crawler API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crawl/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!response.ok) {
    throw new Error('YouTube sync failed')
  }

  const data = await response.json()
  return { count: data.components?.length || 0 }
}
