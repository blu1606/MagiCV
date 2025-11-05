import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { MatchScoreOptimizerService } from '@/services/match-score-optimizer-service'

/**
 * POST /api/cv/match-optimized
 * Calculate optimized match score with caching and detailed breakdown
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { jobDescription, useCache = true, topK = 50 } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'jobDescription is required' },
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

    // Calculate optimized match score
    const startTime = performance.now()
    const result = await MatchScoreOptimizerService.calculateOptimizedMatchScore(
      user.id,
      jobDescription,
      { useCache, topK }
    )
    const duration = performance.now() - startTime

    return NextResponse.json({
      ...result,
      metadata: {
        calculationTime: Math.round(duration),
        cached: duration < 50, // If very fast, likely from cache
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Error in match-optimized:', error)
    return NextResponse.json(
      { error: 'Failed to calculate match score' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cv/match-optimized/cache-stats
 * Get cache statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = MatchScoreOptimizerService.getCacheStats()
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cv/match-optimized
 * Clear match score cache
 */
export async function DELETE(request: NextRequest) {
  try {
    MatchScoreOptimizerService.clearCache()
    return NextResponse.json({ success: true, message: 'Cache cleared' })
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
