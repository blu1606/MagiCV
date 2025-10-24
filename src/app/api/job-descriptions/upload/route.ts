import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdf-service';
import { SupabaseService } from '@/services/supabase-service';

/**
 * POST /api/job-descriptions/upload - Upload and process JD PDF
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await SupabaseService.getUserById(userId);
    if (!user) {
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process PDF
    const result = await PDFService.processPDFAndSave(
      userId,
      buffer,
      file.name
    );

    // Get the created job description
    const jobDescription = await SupabaseService.getJobDescriptionById(
      result.jobDescriptionId
    );

    return NextResponse.json({
      message: 'Job description processed successfully',
      jobDescription,
      componentsCreated: result.componentsCreated,
    });
  } catch (error: any) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

