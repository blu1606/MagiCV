import { NextRequest, NextResponse } from 'next/server';

/**
 * Custom CSRF Protection
 * Implements Double Submit Cookie pattern
 */

export async function csrfProtect(request: NextRequest, response: NextResponse) {
    // 1. Ensure CSRF token cookie exists
    if (!request.cookies.has('csrf_token')) {
        const token = crypto.randomUUID();
        response.cookies.set('csrf_token', token, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
    }

    // 2. Verify CSRF token on state-changing requests
    const method = request.method;
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return;
    }

    // Skip verification for ignored paths
    const pathname = request.nextUrl.pathname;
    if (
        pathname.startsWith('/_next/') ||
        pathname === '/favicon.ico' ||
        pathname.startsWith('/api/webhooks/') ||
        pathname.startsWith('/auth/callback')
    ) {
        return;
    }

    const headerToken = request.headers.get('X-CSRF-Token');
    const cookieToken = request.cookies.get('csrf_token')?.value;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        throw new Error('Invalid CSRF Token');
    }
}

