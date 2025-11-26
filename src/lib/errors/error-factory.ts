/**
 * Error Factory
 * Consistent error creation with context enrichment
 */

import {
    AppError,
    ValidationError,
    AuthError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    APIError,
    DatabaseError,
    FileUploadError,
    ServiceUnavailableError,
    ErrorContext,
} from './custom-errors';
import { ZodError } from 'zod';

/**
 * Generate unique error ID for correlation
 */
export function generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create validation error from Zod error
 */
export function createValidationError(
    zodError: ZodError,
    context: ErrorContext = {}
): ValidationError {
    const fields = zodError.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return new ValidationError(
        'Validation failed',
        fields,
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}

/**
 * Create authentication error
 */
export function createAuthError(
    message?: string,
    context: ErrorContext = {}
): AuthError {
    return new AuthError(message, {
        ...context,
        requestId: context.requestId || generateErrorId(),
    });
}

/**
 * Create forbidden error
 */
export function createForbiddenError(
    message?: string,
    context: ErrorContext = {}
): ForbiddenError {
    return new ForbiddenError(message, {
        ...context,
        requestId: context.requestId || generateErrorId(),
    });
}

/**
 * Create not found error
 */
export function createNotFoundError(
    resource: string,
    message?: string,
    context: ErrorContext = {}
): NotFoundError {
    return new NotFoundError(
        message || `${resource} not found`,
        resource,
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}

/**
 * Create conflict error
 */
export function createConflictError(
    message: string,
    context: ErrorContext = {}
): ConflictError {
    return new ConflictError(message, {
        ...context,
        requestId: context.requestId || generateErrorId(),
    });
}

/**
 * Create rate limit error
 */
export function createRateLimitError(
    retryAfter?: number,
    context: ErrorContext = {}
): RateLimitError {
    return new RateLimitError(
        'Too many requests. Please try again later.',
        retryAfter,
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}

/**
 * Create API error
 */
export function createAPIError(
    service: string,
    message: string,
    originalError?: Error,
    context: ErrorContext = {}
): APIError {
    return new APIError(
        message,
        service,
        originalError,
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}

/**
 * Create database error
 */
export function createDatabaseError(
    message: string,
    query?: string,
    originalError?: Error,
    context: ErrorContext = {}
): DatabaseError {
    return new DatabaseError(
        message,
        query,
        originalError,
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}

/**
 * Create file upload error
 */
export function createFileUploadError(
    message: string,
    context: ErrorContext = {}
): FileUploadError {
    return new FileUploadError(message, {
        ...context,
        requestId: context.requestId || generateErrorId(),
    });
}

/**
 * Create service unavailable error
 */
export function createServiceUnavailableError(
    message?: string,
    context: ErrorContext = {}
): ServiceUnavailableError {
    return new ServiceUnavailableError(message, {
        ...context,
        requestId: context.requestId || generateErrorId(),
    });
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown, context: ErrorContext = {}): AppError {
    // Already an AppError
    if (error instanceof AppError) {
        return error;
    }

    // Zod validation error
    if (error instanceof ZodError) {
        return createValidationError(error, context);
    }

    // Standard Error
    if (error instanceof Error) {
        return new AppError(
            error.message,
            500,
            'INTERNAL_ERROR',
            {
                ...context,
                requestId: context.requestId || generateErrorId(),
                originalError: error.name,
            }
        );
    }

    // Unknown error type
    return new AppError(
        'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR',
        {
            ...context,
            requestId: context.requestId || generateErrorId(),
        }
    );
}
