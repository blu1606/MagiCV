import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdf-service';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/jd/extract - Extract components from Job Description PDF
 * 
 * Multipart form data:
 * - file: PDF file
 * - userId: string
 * - saveToDatabase: boolean (optional, default: true)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const saveToDatabase = formData.get('saveToDatabase') !== 'false';

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'file and userId are required' },
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

    if (saveToDatabase) {
      // Use existing PDF service to parse, extract, and save
      const result = await PDFService.processPDFAndSave(
        userId,
        buffer,
        file.name
      );

      return NextResponse.json({
        success: true,
        message: 'Job description processed and saved',
        cvId: result.cvId,
        pdfId: result.pdfId,
        componentsCreated: result.componentsCreated,
      });
    } else {
      // Just parse and extract without saving
      const rawText = await PDFService.parsePDF(buffer);
      const jdData = await PDFService.extractJDComponents(rawText);

      return NextResponse.json({
        success: true,
        message: 'Job description extracted (not saved)',
        data: jdData,
        rawText: rawText.substring(0, 500) + '...', // Preview only
      });
    }
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
 * GET /api/jd/extract?userId=xxx - Get all extracted JDs for user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get all CVs (JDs) for user
    const cvs = await SupabaseService.getCVsByUserId(userId);

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

