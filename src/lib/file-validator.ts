/**
 * File Upload Validator
 * Validates file uploads for security (MIME type, size, magic bytes)
 */

import { ALLOWED_MIME_TYPES, FILE_SIZE_LIMITS, MAGIC_BYTES, sanitizeFilename } from './validations/file';

export interface FileValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: {
        filename: string;
        mimeType: string;
        size: number;
        extension: string;
    };
}

export interface FileValidationOptions {
    maxSize?: number;
    allowedMimeTypes?: string[];
    checkMagicBytes?: boolean;
}

/**
 * Verify file magic bytes match the claimed MIME type
 */
export function verifyMagicBytes(
    buffer: Buffer,
    mimeType: string
): boolean {
    if (!buffer || buffer.length < 4) {
        return false;
    }

    const bytes = Array.from(buffer.slice(0, 4));

    switch (mimeType) {
        case ALLOWED_MIME_TYPES.PDF:
            return bytes.slice(0, 4).every((byte, i) => byte === MAGIC_BYTES.PDF[i]);

        case ALLOWED_MIME_TYPES.PNG:
            return bytes.slice(0, 4).every((byte, i) => byte === MAGIC_BYTES.PNG[i]);

        case ALLOWED_MIME_TYPES.JPEG:
        case ALLOWED_MIME_TYPES.JPG:
            return bytes.slice(0, 3).every((byte, i) => byte === MAGIC_BYTES.JPEG[i]);

        default:
            return false;
    }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot).toLowerCase();
}

/**
 * Validate file extension matches MIME type
 */
export function validateExtension(
    filename: string,
    mimeType: string
): boolean {
    const extension = getFileExtension(filename);

    switch (mimeType) {
        case ALLOWED_MIME_TYPES.PDF:
            return extension === '.pdf';

        case ALLOWED_MIME_TYPES.PNG:
            return extension === '.png';

        case ALLOWED_MIME_TYPES.JPEG:
        case ALLOWED_MIME_TYPES.JPG:
            return extension === '.jpg' || extension === '.jpeg';

        default:
            return false;
    }
}

/**
 * Generate a secure random filename
 */
export function generateSecureFilename(
    originalFilename: string,
    userId: string
): string {
    const extension = getFileExtension(originalFilename);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);

    return `${userId}-${timestamp}-${random}${extension}`;
}

/**
 * Validate a file upload
 */
export async function validateFileUpload(
    file: File | Buffer,
    filename: string,
    mimeType: string,
    options: FileValidationOptions = {}
): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const {
        maxSize = FILE_SIZE_LIMITS.MAX_FILE_SIZE,
        allowedMimeTypes = Object.values(ALLOWED_MIME_TYPES),
        checkMagicBytes = true,
    } = options;

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(filename);
    if (sanitizedFilename !== filename) {
        warnings.push('Filename was sanitized to remove unsafe characters');
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(mimeType)) {
        errors.push(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Get file size
    const size = file instanceof File ? file.size : file.length;

    // Check file size
    if (size > maxSize) {
        errors.push(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }

    if (size === 0) {
        errors.push('File is empty');
    }

    // Validate extension matches MIME type
    if (!validateExtension(sanitizedFilename, mimeType)) {
        errors.push('File extension does not match MIME type');
    }

    // Verify magic bytes if requested
    if (checkMagicBytes && errors.length === 0) {
        let buffer: Buffer;

        if (file instanceof File) {
            // Convert File to Buffer
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            buffer = file;
        }

        if (!verifyMagicBytes(buffer, mimeType)) {
            errors.push('File content does not match claimed type (possible spoofing attempt)');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            filename: sanitizedFilename,
            mimeType,
            size,
            extension: getFileExtension(sanitizedFilename),
        },
    };
}

/**
 * Check user storage quota
 */
export async function checkUserStorageQuota(
    userId: string,
    currentUsage: number,
    additionalSize: number
): Promise<{ allowed: boolean; reason?: string }> {
    const totalAfterUpload = currentUsage + additionalSize;

    if (totalAfterUpload > FILE_SIZE_LIMITS.MAX_USER_STORAGE) {
        return {
            allowed: false,
            reason: `Storage quota exceeded. Maximum: ${FILE_SIZE_LIMITS.MAX_USER_STORAGE / 1024 / 1024}MB`,
        };
    }

    return { allowed: true };
}
