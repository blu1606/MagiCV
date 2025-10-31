import { NextRequest, NextResponse } from 'next/server';
import { JDMatchingService } from '@/services/jd-matching-service';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/jd/match - Match Job Description with user's CV components
 *
 * This endpoint does NOT save JD to database, only performs matching
 *
 * Multipart form data:
 * - file: PDF file (Job Description)
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('📄 Processing JD for matching:', file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform matching (NO DATABASE SAVE)
    const results = await JDMatchingService.matchJobDescription(buffer, user.id);

    console.log('✅ Matching complete:', {
      jdTitle: results.jdMetadata.title,
      totalComponents: results.jdComponents.length,
      overallScore: results.overallScore,
    });

    return NextResponse.json({
      success: true,
      message: 'Job description matched successfully',
      results,
    });
  } catch (error: any) {
    console.error('❌ JD matching error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
