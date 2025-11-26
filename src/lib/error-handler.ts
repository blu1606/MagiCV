/**
 * Comprehensive Error Handler
 * Handles error classification, PII redaction, context enrichment, and logging
 */

import { AppError, toAppError, generateErrorId, ErrorContext } from './errors';
import { NextResponse } from 'next/server';

// Sensitive fields that should be redacted from logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'authorization',
  'cookie',
  'session',
  'ssn',
  'creditCard',
  'credit_card',
];

// Sensitive patterns to redact from error messages
const SENSITIVE_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit card
  /sk-[a-zA-Z0-9]{48}/g, // API keys (OpenAI pattern)
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub tokens
];

/**
 * Redact PII from error messages and context
 */
export function redactPII(data: any): any {
  if (typeof data === 'string') {
    let redacted = data;
    SENSITIVE_PATTERNS.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]');
    });
    return redacted;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactPII(item));
  }

  if (data && typeof data === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value);
      }
    }
    return redacted;
  }

  return data;
}

/**
 * Strip sensitive data from error stack traces
 */
export function sanitizeStackTrace(stack?: string): string | undefined {
  if (!stack) return undefined;

  let sanitized = stack;

  // Remove file paths that might reveal system structure
  sanitized = sanitized.replace(/\/[^\s]+\//g, '[PATH]/');
  sanitized = sanitized.replace(/[A-Z]:\\[^\s]+\\/g, '[PATH]\\');

  // Redact PII patterns
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
}

/**
 * Determine if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Format error for API response
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    documentation?: string;
  };
}

export function formatErrorResponse(
  error: AppError,
  includeStack: boolean = false
): ErrorResponse {
  const response: ErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      timestamp: error.context.timestamp || new Date().toISOString(),
      requestId: error.context.requestId || generateErrorId(),
    },
  };

  // Add validation details if available
  if ('fields' in error && error.fields) {
    response.error.details = error.fields;
  }

  // Add documentation link for common errors
  if (error.code) {
    response.error.documentation = `https://docs.magicv.ai/errors/${error.code.toLowerCase()}`;
  }

  // Include stack trace only in development
  if (includeStack && !isProduction() && error.stack) {
    (response.error as any).stack = error.stack;
  }

  return response;
}

/**
 * Log error with context
 */
export function logError(error: AppError, context: ErrorContext = {}): void {
  const logData = {
    level: 'error',
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    context: redactPII({
      ...error.context,
      ...context,
    }),
    stack: isProduction() ? undefined : sanitizeStackTrace(error.stack),
    timestamp: new Date().toISOString(),
  };

  // In production, use structured logging (will be replaced with Pino later)
  if (isProduction()) {
    console.error(JSON.stringify(logData));
  } else {
    console.error('❌ Error:', logData);
  }
}

/**
 * Main error handler for API routes
 */
export function handleAPIError(
  error: unknown,
  context: ErrorContext = {}
): NextResponse<ErrorResponse> {
  // Convert to AppError
  const appError = toAppError(error, context);

  // Log the error
  logError(appError, context);

  // Format response
  const response = formatErrorResponse(appError, !isProduction());

  // Add retry-after header for rate limit errors
  const headers: Record<string, string> = {};
  if ('retryAfter' in appError && appError.retryAfter) {
    headers['Retry-After'] = appError.retryAfter.toString();
  }

  return NextResponse.json(response, {
    status: appError.statusCode,
    headers,
  });
}

/**
 * Legacy compatibility - simple error handler
 */
export const errorHandler = {
  handleAPIError(error: any): { message: string; code?: string } {
    const appError = toAppError(error);
    return {
      message: appError.message,
      code: appError.code,
    };
  },
};

/**
 * Error handler for async route handlers
 */
export function asyncHandler(
  handler: (req: any, context?: any) => Promise<NextResponse>
) {
  return async (req: any, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleAPIError(error, {
        endpoint: req.url,
        method: req.method,
      });
    }
  };
}

