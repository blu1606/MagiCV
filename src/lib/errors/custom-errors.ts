/**
 * Custom Error Classes
 * Type-safe error handling with proper classification
 */

export interface ErrorContext {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    timestamp?: string;
    [key: string]: any;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly context: ErrorContext;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        context: ErrorContext = {},
        isOperational: boolean = true
    ) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.context = {
            ...context,
            timestamp: context.timestamp || new Date().toISOString(),
        };
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
    public readonly fields?: Array<{ field: string; message: string }>;

    constructor(
        message: string,
        fields?: Array<{ field: string; message: string }>,
        context: ErrorContext = {}
    ) {
        super(message, 400, 'VALIDATION_ERROR', context);
        this.fields = fields;
    }
}

/**
 * Authentication Error (401)
 */
export class AuthError extends AppError {
    constructor(
        message: string = 'Authentication required',
        context: ErrorContext = {}
    ) {
        super(message, 401, 'AUTH_ERROR', context);
    }
}

/**
 * Authorization Error (403)
 */
export class ForbiddenError extends AppError {
    constructor(
        message: string = 'Access forbidden',
        context: ErrorContext = {}
    ) {
        super(message, 403, 'FORBIDDEN_ERROR', context);
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
    public readonly resource?: string;

    constructor(
        message: string = 'Resource not found',
        resource?: string,
        context: ErrorContext = {}
    ) {
        super(message, 404, 'NOT_FOUND_ERROR', context);
        this.resource = resource;
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
    constructor(
        message: string = 'Resource conflict',
        context: ErrorContext = {}
    ) {
        super(message, 409, 'CONFLICT_ERROR', context);
    }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
    public readonly retryAfter?: number;

    constructor(
        message: string = 'Too many requests',
        retryAfter?: number,
        context: ErrorContext = {}
    ) {
        super(message, 429, 'RATE_LIMIT_ERROR', context);
        this.retryAfter = retryAfter;
    }
}

/**
 * External API Error (502)
 */
export class APIError extends AppError {
    public readonly service?: string;
    public readonly originalError?: Error;

    constructor(
        message: string,
        service?: string,
        originalError?: Error,
        context: ErrorContext = {}
    ) {
        super(message, 502, 'API_ERROR', context);
        this.service = service;
        this.originalError = originalError;
    }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
    public readonly query?: string;
    public readonly originalError?: Error;

    constructor(
        message: string,
        query?: string,
        originalError?: Error,
        context: ErrorContext = {}
    ) {
        super(message, 500, 'DATABASE_ERROR', context);
        this.query = query;
        this.originalError = originalError;
    }
}

/**
 * File Upload Error (400)
 */
export class FileUploadError extends AppError {
    constructor(
        message: string,
        context: ErrorContext = {}
    ) {
        super(message, 400, 'FILE_UPLOAD_ERROR', context);
    }
}

/**
 * Service Unavailable Error (503)
 */
export class ServiceUnavailableError extends AppError {
    constructor(
        message: string = 'Service temporarily unavailable',
        context: ErrorContext = {}
    ) {
        super(message, 503, 'SERVICE_UNAVAILABLE_ERROR', context);
    }
}
