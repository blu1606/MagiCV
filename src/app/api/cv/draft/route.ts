import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/cv/draft - Save or update CV draft
 *
 * Body:
 * {
 *   cvId?: string, // If updating existing draft
 *   title?: string,
 *   jobDescription?: string,
 *   cvData: {
 *     name: string,
 *     email: string,
 *     phone: string,
 *     summary: string,
 *     experience: Array,
 *     skills: Array,
 *     education: Array,
 *     projects: Array
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cvId, title, jobDescription, cvData } = body;

    if (!cvData) {
      return NextResponse.json(
        { error: 'cvData is required' },
        { status: 400 }
      );
    }

    let result;

    if (cvId) {
      // Update existing draft
      console.log('💾 Updating CV draft:', cvId);

      result = await SupabaseService.updateCV(cvId, {
        title: title || `CV for ${cvData.name}`,
        job_description: jobDescription || null,
        content: cvData,
        updated_at: new Date().toISOString(),
      });
    } else {
      // Create new draft
      console.log('💾 Creating new CV draft');

      result = await SupabaseService.createCV({
        user_id: user.id,
        title: title || `CV for ${cvData.name} - Draft`,
        job_description: jobDescription || null,
        match_score: undefined,
        content: cvData,
      });
    }

    return NextResponse.json({
      success: true,
      cv: result,
      message: cvId ? 'Draft updated' : 'Draft created',
    });
  } catch (error: any) {
    console.error('❌ Error saving draft:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cv/draft?cvId=xxx - Get CV draft
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get('cvId');

    if (!cvId) {
      return NextResponse.json(
        { error: 'cvId is required' },
        { status: 400 }
      );
    }

    const cv = await SupabaseService.getCVById(cvId);

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cv.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      cv,
    });
  } catch (error: any) {
    console.error('❌ Error fetching draft:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
