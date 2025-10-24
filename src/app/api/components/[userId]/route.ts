import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/components/:userId - Get all components for a user
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

    if (source) {
      const components = await SupabaseService.getComponentsBySource(
        userId,
        source as any
      );
      return NextResponse.json(components);
    }

    if (type) {
      const components = await SupabaseService.getComponentsByType(
        userId,
        type as any
      );
      return NextResponse.json(components);
    }

    const result = await SupabaseService.getUserComponents(userId);
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

