import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/components/:userId - Get all components for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const type = searchParams.get('type');

    if (source) {
      const components = await SupabaseService.getComponentsBySource(
        params.userId,
        source as any
      );
      return NextResponse.json(components);
    }

    if (type) {
      const components = await SupabaseService.getComponentsByType(
        params.userId,
        type as any
      );
      return NextResponse.json(components);
    }

    const result = await SupabaseService.getUserComponents(params.userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/components/:userId - Delete components for a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    if (source) {
      const count = await SupabaseService.deleteComponentsBySource(
        params.userId,
        source as any
      );
      return NextResponse.json({
        message: `Deleted ${count} components from ${source}`,
        deletedCount: count,
      });
    }

    const count = await SupabaseService.deleteUserComponents(params.userId);
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

