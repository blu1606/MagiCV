import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { handleAPIError, redactPII } from './error-handler';
import { logger } from './logger';
import { generateErrorId } from './errors';

type RouteHandler = (
    req: NextRequest,
    context: { params: any }
) => Promise<NextResponse>;

interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}

/**
 * Higher-order function to wrap API routes with:
 * 1. Error handling
 * 2. Request logging
 * 3. Input validation (body, query, params)
 */
export function withValidation(
    handler: RouteHandler,
    schemas?: ValidationSchemas
): RouteHandler {
    return async (req: NextRequest, context: { params: any }) => {
        const requestId = generateErrorId();
        const startTime = Date.now();
        const method = req.method;
        const url = req.url;

        // Create child logger for this request
        const requestLogger = logger.child({
            requestId,
            method,
            url,
            endpoint: new URL(url).pathname,
        });

        try {
            requestLogger.info('Request started');

            // 1. Validate Params (if schema provided)
            if (schemas?.params && context.params) {
                const result = schemas.params.safeParse(context.params);
                if (!result.success) {
                    throw result.error;
                }
                // Update params with parsed data (coercion etc)
                context.params = result.data;
            }

            // 2. Validate Query Params (if schema provided)
            if (schemas?.query) {
                const { searchParams } = new URL(req.url);
                const queryObj: Record<string, any> = {};
                for (const [key, value] of searchParams.entries()) {
                    // Handle array params (key[]=value)
                    if (key.endsWith('[]')) {
                        const cleanKey = key.slice(0, -2);
                        if (!queryObj[cleanKey]) queryObj[cleanKey] = [];
                        queryObj[cleanKey].push(value);
                    } else {
                        queryObj[key] = value;
                    }
                }

                const result = schemas.query.safeParse(queryObj);
                if (!result.success) {
                    throw result.error;
                }
            }

            // 3. Validate Body (if schema provided)
            // Note: We clone the request to read body, so handler can read it again
            if (schemas?.body) {
                const contentType = req.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const bodyClone = await req.clone().json();
                    const result = schemas.body.safeParse(bodyClone);
                    if (!result.success) {
                        throw result.error;
                    }
                }
            }

            // 4. Execute Handler
            const response = await handler(req, context);

            // 5. Log Response
            const duration = Date.now() - startTime;
            requestLogger.info({
                statusCode: response.status,
                duration,
            }, 'Request completed');

            return response;

        } catch (error) {
            // Handle and log error
            const duration = Date.now() - startTime;
            requestLogger.error({
                err: error,
                duration,
            }, 'Request failed');

            return handleAPIError(error, {
                requestId,
                endpoint: url,
                method,
                duration,
            });
        }
    };
}

/**
 * Simple wrapper for just error handling and logging (no validation)
 */
export function withErrorHandling(handler: RouteHandler): RouteHandler {
    return withValidation(handler);
}
