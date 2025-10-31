import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdf-service';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/jd/extract - Extract components from Job Description PDF
 *
 * Multipart form data:
 * - file: PDF file
 * - saveToDatabase: boolean (ignored; flow now generates PDF without saving)
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
    // Deprecated flag: we no longer save JD or components to DB in this endpoint

    if (!file) {
      return NextResponse.json(
        { error: 'file is required' },
        { status: 400 }
      );
    }

    // Verify user profile exists
    const profile = await SupabaseService.getProfileById(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    console.log('📄 Processing JD PDF:', file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // New flow: parse JD, match user components, generate LaTeX content and export PDF (no DB save)
    const rawText = await PDFService.parsePDF(buffer);
    const { pdfBuffer, cvData } = await CVGeneratorService.generateCVPDF(
      user.id,
      rawText,
      { includeProjects: true }
    );

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${user.id}.pdf"`,
        'X-Generated-For': user.id,
      },
    });
  } catch (error: any) {
    console.error('❌ JD extraction error:', error.message);
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
 * GET /api/jd/extract - Get all extracted JDs for authenticated user
 */
export async function GET(request: NextRequest) {
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

    // Get all CVs (JDs) for user
    const cvs = await SupabaseService.getCVsByUserId(user.id);

    // Get PDFs for each CV
    const cvsWithPdfs = await Promise.all(
      cvs.map(async (cv) => {
        const pdfs = await SupabaseService.getCVPdfsByCVId(cv.id);
        return {
          ...cv,
          pdfs,
        };
      })
    );

    return NextResponse.json({
      total: cvs.length,
      cvs: cvsWithPdfs,
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

