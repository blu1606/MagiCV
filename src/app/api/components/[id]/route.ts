import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';
import { EmbeddingService } from '@/services/embedding-service';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/components/[id] - Get component by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const component = await SupabaseService.getComponentById(id);

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(component);
  } catch (error: any) {
    console.error('❌ Error fetching component:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/components/[id] - Update component
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updates = await request.json();

    // Get existing component to verify ownership
    const existing = await SupabaseService.getComponentById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this component' },
        { status: 403 }
      );
    }

    // Check if content changed (need to regenerate embedding)
    const contentChanged =
      (updates.title && updates.title !== existing.title) ||
      (updates.description && updates.description !== existing.description) ||
      (updates.organization && updates.organization !== existing.organization);

    // Update component
    let updatedComponent = await SupabaseService.updateComponent(id, updates);

    // Regenerate embedding if content changed
    if (contentChanged) {
      console.log('🔄 Content changed, regenerating embedding...');
      const embedding = await EmbeddingService.embedComponentObject(updatedComponent);
      updatedComponent = await SupabaseService.updateComponent(id, { embedding });
      console.log('✅ Embedding regenerated');
    }

    return NextResponse.json({
      success: true,
      component: updatedComponent,
      embeddingRegenerated: contentChanged,
    });
  } catch (error: any) {
    console.error('❌ Error updating component:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/components/[id] - Delete component
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get existing component to verify ownership
    const existing = await SupabaseService.getComponentById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this component' },
        { status: 403 }
      );
    }

    // Delete component
    await SupabaseService.deleteComponent(id);

    return NextResponse.json({
      success: true,
      message: 'Component deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting component:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
