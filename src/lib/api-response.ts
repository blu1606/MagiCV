import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
    success: true;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        [key: string]: any;
    };
    message?: string;
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
    data: T,
    options: {
        status?: number;
        message?: string;
        meta?: ApiResponse['meta'];
        headers?: Record<string, string>;
    } = {}
): NextResponse<ApiResponse<T>> {
    const { status = 200, message, meta, headers = {} } = options;

    return NextResponse.json(
        {
            success: true,
            data,
            ...(message && { message }),
            ...(meta && { meta }),
        },
        {
            status,
            headers,
        }
    );
}

/**
 * Create a standardized created (201) response
 */
export function createdResponse<T>(
    data: T,
    message: string = 'Resource created successfully',
    headers: Record<string, string> = {}
): NextResponse<ApiResponse<T>> {
    return successResponse(data, { status: 201, message, headers });
}

/**
 * Create a standardized no content (204) response
 */
export function noContentResponse(headers: Record<string, string> = {}): NextResponse {
    return new NextResponse(null, { status: 204, headers });
}
