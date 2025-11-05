import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/data-sources/status
 * Get connection status for all data sources (GitHub, LinkedIn, YouTube)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all accounts for user
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)

    if (accountsError) {
      console.error('Error fetching accounts:', accountsError)
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
    }

    // Get component counts per source
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select('account_id, src')
      .eq('user_id', user.id)

    if (componentsError) {
      console.error('Error fetching components:', componentsError)
    }

    // Build status for each provider
    const providers = ['github', 'linkedin', 'youtube'] as const
    const sources = providers.map((provider) => {
      const account = accounts?.find((a) => a.provider === provider)

      // Count components from this source
      const componentCount = components?.filter(
        (c) => c.account_id === account?.id || c.src?.includes(provider)
      ).length || 0

      // Determine status
      let status: 'synced' | 'syncing' | 'error' | 'never' = 'never'
      if (account) {
        if (account.last_synced_at) {
          status = 'synced'
        } else {
          status = 'never'
        }
      }

      return {
        id: account?.id || `${provider}-not-connected`,
        provider,
        connected: !!account,
        lastSynced: account?.last_synced_at,
        status,
        stats: {
          components: componentCount,
        },
      }
    })

    return NextResponse.json({ sources })
  } catch (error: any) {
    console.error('Error in data-sources/status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
