import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';
import { parsePaginationParams } from '@/lib/pagination';

/**
 * GET /api/components/user/:userId - Get all components for a user
 * Supports pagination via cursor, limit, sortBy, sortOrder query params
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const type = searchParams.get('type');
    const usePagination = searchParams.get('paginated') === 'true' ||
                          searchParams.has('cursor') ||
                          searchParams.has('limit');

    // Parse pagination params
    const paginationParams = parsePaginationParams(searchParams);

    // Handle source filter
    if (source) {
      if (usePagination) {
        const result = await SupabaseService.getComponentsBySourcePaginated(
          userId,
          source as any,
          paginationParams
        );
        return NextResponse.json(result);
      } else {
        const components = await SupabaseService.getComponentsBySource(
          userId,
          source as any
        );
        return NextResponse.json(components);
      }
    }

    // Handle type filter
    if (type) {
      if (usePagination) {
        const result = await SupabaseService.getComponentsByTypePaginated(
          userId,
          type as any,
          paginationParams
        );
        return NextResponse.json(result);
      } else {
        const components = await SupabaseService.getComponentsByType(
          userId,
          type as any
        );
        return NextResponse.json(components);
      }
    }

    // Default: all components
    if (usePagination) {
      const result = await SupabaseService.getUserComponentsPaginated(
        userId,
        paginationParams
      );
      return NextResponse.json(result);
    } else {
      const result = await SupabaseService.getUserComponents(userId);
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/components/user/:userId - Delete components for a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    if (source) {
      const count = await SupabaseService.deleteComponentsBySource(
        userId,
        source as any
      );
      return NextResponse.json({
        message: `Deleted ${count} components from ${source}`,
        deletedCount: count,
      });
    }

    const count = await SupabaseService.deleteUserComponents(userId);
    return NextResponse.json({
      message: `Deleted ${count} components`,
      deletedCount: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
