import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/cv/[id]/duplicate - Duplicate an existing CV
 *
 * Creates a copy of the specified CV with " (Copy)" appended to title
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const cvId = id;

    // Get original CV
    const originalCV = await SupabaseService.getCVById(cvId);

    if (!originalCV) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (originalCV.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this CV' },
        { status: 403 }
      );
    }

    // Create duplicate
    const duplicatedCV = await SupabaseService.createCV({
      user_id: user.id,
      title: `${originalCV.title} (Copy)`,
      job_description: originalCV.job_description,
      match_score: originalCV.match_score,
      content: originalCV.content,
    });

    console.log('✅ CV duplicated:', duplicatedCV.id);

    return NextResponse.json({
      success: true,
      cv: duplicatedCV,
      message: 'CV duplicated successfully',
    });
  } catch (error: any) {
    console.error('❌ Error duplicating CV:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to duplicate CV' },
      { status: 500 }
    );
  }
}
