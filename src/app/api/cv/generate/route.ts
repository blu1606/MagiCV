import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { createClient } from '@supabase/supabase-js';
import { withValidation } from '@/lib/api-middleware';
import { cvGenerateSchema } from '@/lib/validations/cv';
import { createAuthError, createNotFoundError } from '@/lib/errors';

/**
 * POST /api/cv/generate - Generate CV PDF from template
 */
async function generateCV(request: NextRequest) {
  // 1. Authenticate user from Supabase session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        }
      }
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw createAuthError('Unauthorized - Please login first');
  }

  const userId = user.id;

  // 2. Parse request body (already validated by middleware)
  const body = await request.json();
  const {
    jobDescription = '',
    cvData: providedCvData,
    includeProjects = true,
    useOnlineCompiler = false,
    saveToDatabase = false,
    useHybridArchitecture = true
  } = body;

  // 3. Verify user profile exists
  const profile = await SupabaseService.getProfileById(userId);
  if (!profile) {
    throw createNotFoundError('User profile', `User profile not found for ID: ${userId}`);
  }

  // 4. Generate CV PDF
  const { pdfBuffer, cvData: generatedCvData } = useHybridArchitecture
    ? await CVGeneratorService.generateCVPDFHybrid(
      userId,
      jobDescription,
      {
        includeProjects,
        useOnlineCompiler,
      }
    )
    : await CVGeneratorService.generateCVPDF(
      userId,
      jobDescription,
      {
        includeProjects,
        useOnlineCompiler,
      }
    );

  // 5. Calculate match score (only if job description provided)
  const matchScore = jobDescription
    ? await CVGeneratorService.calculateMatchScore(userId, jobDescription)
    : { score: 0, summary: 'Generic CV - no job description provided' };

  let cvRecord = null;
  let pdfRecord = null;

  if (saveToDatabase) {
    // Save CV to database
    const cvTitle = jobDescription
      ? `CV for ${generatedCvData.profile.name} - Optimized`
      : `CV for ${generatedCvData.profile.name} - Generic`;

    cvRecord = await SupabaseService.createCV({
      user_id: userId,
      title: cvTitle,
      job_description: jobDescription || null,
      match_score: matchScore.score,
      content: generatedCvData,
    });

    // Upload PDF to Supabase Storage
    const filename = `cv-${userId}-${Date.now()}.pdf`;
    const { path, url } = await SupabaseService.uploadCVPdf(
      userId,
      filename,
      pdfBuffer
    );

    // Save PDF record
    pdfRecord = await SupabaseService.createCVPdf({
      user_id: userId,
      cv_id: cvRecord.id,
      file_url: url,
      filename: filename,
      mime_type: 'application/pdf',
      byte_size: pdfBuffer.length,
      version: 1,
    });
  }

  // 6. Return PDF as response
  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${userId}.pdf"`,
      'X-CV-Id': cvRecord?.id || 'not-saved',
      'X-PDF-Id': pdfRecord?.id || 'not-saved',
      'X-Match-Score': matchScore.score.toString(),
    },
  });
}

export const POST = withValidation(generateCV, {
  body: cvGenerateSchema
});

/**
 * GET /api/cv/generate?userId=xxx&format=json
 * Get CV data without generating PDF (for preview)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobDescription = searchParams.get('jobDescription') || '';
    const format = searchParams.get('format') || 'json';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Generate CV content only
    const cvData = await CVGeneratorService.generateCVContent(
      userId,
      jobDescription,
      { includeProjects: true }
    );

    // Calculate match score
    const matchScore = await CVGeneratorService.calculateMatchScore(
      userId,
      jobDescription
    );

    return NextResponse.json({
      cvData,
      matchScore,
      message: 'CV content generated (no PDF)',
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

