import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/cv/[id] - Get CV by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cv = await SupabaseService.getCVById(id);

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Get associated PDFs
    const pdfs = await SupabaseService.getCVPdfsByCVId(id);

    return NextResponse.json({
      ...cv,
      pdfs,
    });
  } catch (error: any) {
    console.error('❌ Error fetching CV:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cv/[id] - Update CV
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const updates = await request.json();

    // Get existing CV to verify ownership
    const existing = await SupabaseService.getCVById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this CV' },
        { status: 403 }
      );
    }

    // Update CV
    const updatedCV = await SupabaseService.updateCV(id, updates);

    return NextResponse.json({
      success: true,
      cv: updatedCV,
    });
  } catch (error: any) {
    console.error('❌ Error updating CV:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cv/[id] - Delete CV and associated PDFs
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get existing CV to verify ownership
    const existing = await SupabaseService.getCVById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this CV' },
        { status: 403 }
      );
    }

    // Get associated PDFs to delete files from storage
    const pdfs = await SupabaseService.getCVPdfsByCVId(id);

    // Delete PDF files from storage
    for (const pdf of pdfs) {
      try {
        // Extract path from URL or use filename
        const path = pdf.filename || pdf.file_url;
        if (path) {
          await SupabaseService.deleteCVPdfFile(path);
          console.log(`✅ Deleted PDF file: ${path}`);
        }
      } catch (err: any) {
        console.warn(`⚠️ Failed to delete PDF file: ${err.message}`);
        // Continue deleting CV even if file deletion fails
      }
    }

    // Delete CV (will cascade delete PDFs from database)
    await SupabaseService.deleteCV(id);

    return NextResponse.json({
      success: true,
      message: 'CV and associated files deleted successfully',
      deletedPDFs: pdfs.length,
    });
  } catch (error: any) {
    console.error('❌ Error deleting CV:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
