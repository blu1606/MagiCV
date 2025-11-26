import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/services/supabase-service'
import { parsePaginationParams } from '@/lib/pagination'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/cvs - Get all CVs for the authenticated user
 * Supports pagination via cursor, limit, sortBy, sortOrder query params
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const usePagination = searchParams.get('paginated') === 'true' ||
                          searchParams.has('cursor') ||
                          searchParams.has('limit');

    if (usePagination) {
      // Use pagination
      const paginationParams = parsePaginationParams(searchParams);
      const result = await SupabaseService.getCVsByUserIdPaginated(
        user.id,
        paginationParams
      );
      return NextResponse.json(result);
    } else {
      // Return all CVs (backward compatible)
      const cvs = await SupabaseService.getCVsByUserId(user.id);
      return NextResponse.json(cvs);
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    )
  }
}



