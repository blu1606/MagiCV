import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/cv/[id]/download - Download CV PDF by ID
 * 
 * Downloads the latest PDF version of a CV from Supabase Storage
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Get CV to verify ownership
    const cv = await SupabaseService.getCVById(id);
    
    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (cv.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - CV does not belong to you' },
        { status: 403 }
      );
    }

    // Get associated PDFs
    const pdfs = await SupabaseService.getCVPdfsByCVId(id);
    
    if (!pdfs || pdfs.length === 0) {
      return NextResponse.json(
        { error: 'No PDF found for this CV. Please regenerate the CV first.' },
        { status: 404 }
      );
    }

    // Get the latest PDF (highest version or most recent)
    const latestPdf = pdfs.sort((a, b) => {
      if (a.version !== b.version) {
        return b.version - a.version;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];

    // Download from Supabase Storage
    // Use admin client for storage access
    const supabaseAdmin = getSupabaseAdmin();
    
    // Extract file path from URL (format: /storage/v1/object/public/cv-pdfs/filename.pdf)
    // or it might be just the filename
    let filePath = latestPdf.file_url;
    
    // If it's a full URL, extract the path after the bucket name
    if (filePath.includes('/cv-pdfs/')) {
      filePath = filePath.split('/cv-pdfs/')[1];
    } else if (filePath.startsWith('/')) {
      filePath = filePath.substring(1);
    }

    // Download from storage bucket
    const { data, error: downloadError } = await supabaseAdmin.storage
      .from('cv-pdfs')
      .download(filePath);

    if (downloadError || !data) {
      console.error('❌ Storage download error:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download PDF from storage' },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return PDF with proper headers
    const filename = latestPdf.filename || `CV-${cv.title}-${Date.now()}.pdf`;
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('❌ CV download error:', error.message);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to download CV',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}

