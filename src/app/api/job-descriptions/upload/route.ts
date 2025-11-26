import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '@/services/pdf-service';
import { CVGeneratorService } from '@/services/cv-generator-service';
import { SupabaseService } from '@/services/supabase-service';
import { withErrorHandling } from '@/lib/api-middleware';
import { validateFileUpload } from '@/lib/file-validator';
import { createValidationError, createNotFoundError } from '@/lib/errors';
import { ALLOWED_MIME_TYPES } from '@/lib/validations/file';

/**
 * POST /api/job-descriptions/upload - Upload and process JD PDF
 */
async function uploadJobDescription(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    throw createValidationError(
      { name: 'ValidationError', message: 'Missing required fields' } as any,
      {
        fields: [
          { field: 'file', message: 'File is required' },
          { field: 'userId', message: 'User ID is required' },
        ],
      }
    );
  }

  // Verify user exists
  const user = await SupabaseService.getUserById(userId);
  if (!user) {
    throw createNotFoundError('User', `User not found: ${userId}`);
  }

  // Validate file
  const validation = await validateFileUpload(
    file,
    file.name,
    file.type,
    {
      allowedMimeTypes: [ALLOWED_MIME_TYPES.PDF],
      checkMagicBytes: true,
    }
  );

  if (!validation.valid) {
    throw createValidationError(
      { name: 'ValidationError', message: 'File validation failed' } as any,
      {
        fields: validation.errors.map(err => ({
          field: 'file',
          message: err,
        })),
      }
    );
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // New flow: Parse JD text, match to user's components, generate LaTeX + PDF without saving
  const rawText = await PDFService.parsePDF(buffer);
  const { pdfBuffer } = await CVGeneratorService.generateCVPDF(
    userId,
    rawText,
    { includeProjects: true }
  );

  return new NextResponse(Buffer.from(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-${userId}.pdf"`,
    },
  });
}

export const POST = withErrorHandling(uploadJobDescription);


