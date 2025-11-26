import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { csrfProtect } from '@/lib/csrf'
import { checkRateLimit, getRateLimitIdentifier, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'

// Cache user sessions to reduce redundant auth checks
// Cache expires after 30 seconds
const userCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

function getCachedUser(sessionKey: string) {
  const cached = userCache.get(sessionKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user
  }
  userCache.delete(sessionKey)
  return null
}

function setCachedUser(sessionKey: string, user: any) {
  userCache.set(sessionKey, { user, timestamp: Date.now() })

  // Clean up old cache entries periodically
  if (userCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        userCache.delete(key)
      }
    }
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  // 1. CSRF Protection
  try {
    await csrfProtect(request, response)
  } catch (err) {
    return new NextResponse('Invalid CSRF Token', { status: 403 })
  }

  // 2. Rate Limiting for API routes
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/')) {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Determine rate limit config based on endpoint
    let rateLimitConfig = RATE_LIMITS.DEFAULT;
    let rateLimitKey = '';

    if (pathname.includes('/api/cv/generate') || pathname.includes('/api/cv/match')) {
      rateLimitConfig = RATE_LIMITS.CV_GENERATION;
      rateLimitKey = getRateLimitIdentifier(undefined, ip, 'cv-generation');
    } else if (pathname.includes('/api/job-descriptions/upload') || pathname.includes('/api/components/generate')) {
      rateLimitConfig = RATE_LIMITS.FILE_UPLOAD;
      rateLimitKey = getRateLimitIdentifier(undefined, ip, 'file-upload');
    } else {
      rateLimitConfig = RATE_LIMITS.API_QUERY;
      rateLimitKey = getRateLimitIdentifier(undefined, ip, 'api');
    }

    try {
      const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitConfig, 'free');

      // Add rate limit headers to response
      const headers = getRateLimitHeaders(rateLimitResult);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      if (!rateLimitResult.allowed) {
        const retryAfter = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
        return new NextResponse(
          JSON.stringify({
            error: {
              code: 'RATE_LIMIT_ERROR',
              message: 'Too many requests. Please try again later.',
              retryAfter,
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt.toISOString(),
            }
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': retryAfter.toString(),
              ...headers,
            },
          }
        );
      }
    } catch (err) {
      // Log rate limit error but don't block request
      console.error('Rate limit check failed:', err);
    }
  }

  // 3. Supabase Authentication
  let supabaseResponse = response

  // Get session key from cookies for caching
  const sessionKey = request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('sb-refresh-token')?.value ||
    'no-session'

  // Check cache first
  const cachedUser = getCachedUser(sessionKey)
  if (cachedUser !== null) {
    // Use cached user, but still create supabase client for cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            // Copy CSRF headers if any
            const csrfToken = response.headers.get('set-cookie')
            if (csrfToken) {
              supabaseResponse.headers.append('set-cookie', csrfToken)
            }

            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const user = cachedUser

    // Protect authenticated routes with cached user
    if (
      !user &&
      (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/editor') ||
        request.nextUrl.pathname.startsWith('/components') ||
        request.nextUrl.pathname.startsWith('/settings'))
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // No cache hit, perform full auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          // Copy CSRF headers if any
          const csrfToken = response.headers.get('set-cookie')
          if (csrfToken) {
            supabaseResponse.headers.append('set-cookie', csrfToken)
          }

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Cache the user for future requests
  setCachedUser(sessionKey, user)

  // Protect authenticated routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/editor') ||
      request.nextUrl.pathname.startsWith('/components') ||
      request.nextUrl.pathname.startsWith('/settings'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from landing page (DISABLED for testing)
  // if (user && request.nextUrl.pathname === '/') {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/dashboard'
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (OAuth callback - should not be intercepted)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

