import { NextRequest, NextResponse } from 'next/server';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/cv/generate - Generate CV PDF from template
 * 
 * Body:
 * {
 *   userId: string,
 *   jobDescription: string,
 *   includeProjects?: boolean,
 *   useOnlineCompiler?: boolean,
 *   saveToDatabase?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      jobDescription, 
      includeProjects = true,
      useOnlineCompiler = false,
      saveToDatabase = true 
    } = body;

    if (!userId || !jobDescription) {
      return NextResponse.json(
        { error: 'userId and jobDescription are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const profile = await SupabaseService.getProfileById(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('📝 Generating CV for user:', userId);

    // Generate CV PDF
    const { pdfBuffer, cvData } = await CVGeneratorService.generateCVPDF(
      userId,
      jobDescription,
      {
        includeProjects,
        useOnlineCompiler,
      }
    );

    // Calculate match score
    const matchScore = await CVGeneratorService.calculateMatchScore(
      userId,
      jobDescription
    );

    let cvRecord = null;
    let pdfRecord = null;

    if (saveToDatabase) {
      // Save CV to database
      cvRecord = await SupabaseService.createCV({
        user_id: userId,
        title: `CV for ${cvData.profile.name}`,
        job_description: jobDescription,
        match_score: matchScore.score,
        content: cvData,
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

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
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

