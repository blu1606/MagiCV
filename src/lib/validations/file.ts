import { z } from 'zod';

/**
 * File upload validation schemas
 */

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
    PDF: 'application/pdf',
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    JPG: 'image/jpg',
} as const;

export const allowedMimeTypes = Object.values(ALLOWED_MIME_TYPES);

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB per file
    MAX_USER_STORAGE: 100 * 1024 * 1024, // 100MB per user
} as const;

// Magic bytes for file type verification
export const MAGIC_BYTES = {
    PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
    PNG: [0x89, 0x50, 0x4E, 0x47], // PNG signature
    JPEG: [0xFF, 0xD8, 0xFF], // JPEG signature
} as const;

// File upload metadata schema
export const fileUploadMetadataSchema = z.object({
    filename: z.string().trim().min(1).max(255),
    mimeType: z.enum(allowedMimeTypes as [string, ...string[]]),
    size: z.number().int().positive().max(FILE_SIZE_LIMITS.MAX_FILE_SIZE, 'File too large (max 10MB)'),
    userId: z.string().uuid(),
});

export type FileUploadMetadata = z.infer<typeof fileUploadMetadataSchema>;

// File validation result
export const fileValidationResultSchema = z.object({
    valid: z.boolean(),
    errors: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
    metadata: z.object({
        filename: z.string(),
        mimeType: z.string(),
        size: z.number(),
        extension: z.string(),
    }).optional(),
});

export type FileValidationResult = z.infer<typeof fileValidationResultSchema>;

/**
 * Validate file extension matches MIME type
 */
export function getExpectedExtension(mimeType: string): string {
    switch (mimeType) {
        case ALLOWED_MIME_TYPES.PDF:
            return '.pdf';
        case ALLOWED_MIME_TYPES.PNG:
            return '.png';
        case ALLOWED_MIME_TYPES.JPEG:
        case ALLOWED_MIME_TYPES.JPG:
            return '.jpg';
        default:
            return '';
    }
}

/**
 * Validate filename is safe (no path traversal)
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators and dangerous characters
    return filename
        .replace(/[/\\]/g, '')
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '')
        .trim();
}
