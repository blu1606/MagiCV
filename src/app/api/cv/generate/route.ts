import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/cv/generate - Generate CV PDF from template
 *
 * Authentication: Uses Supabase session from cookies
 *
 * Body:
 * {
 *   jobDescription?: string, // Optional: if provided, optimizes CV for specific job
 *   cvData?: object, // Optional: if provided, use this instead of querying components
 *   includeProjects?: boolean,
 *   useOnlineCompiler?: boolean,
 *   saveToDatabase?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
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
      console.error('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    console.log('✅ Authenticated user:', userId, user.email);
    
    // 2. Parse request body
    const body = await request.json();
    const {
      jobDescription = '', // Optional: if empty, generates generic comprehensive CV
      cvData: providedCvData, // Optional: direct CV data from frontend
      includeProjects = true,
      useOnlineCompiler = false,
      saveToDatabase = false
    } = body;

    // Job description is now optional - if not provided, generate generic CV with best components

    // 3. Verify user profile exists
    const profile = await SupabaseService.getProfileById(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('📝 Generating CV for user:', userId, jobDescription ? '(optimized for job)' : '(generic CV)');

    // 4. Generate CV PDF
    const { pdfBuffer, cvData: generatedCvData } = await CVGeneratorService.generateCVPDF(
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

      console.log('✅ CV saved to database:', cvRecord.id);
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
  } catch (error: any) {
    console.error('❌ CV generation error:', error.message);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

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

