import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = [
      "/login", 
      "/reset-password",
      "/api/auth/login", 
      "/api/test-db", 
      "/api/test-auth",
      "/api/test-login",
      "/unauthorized"
    ]

    // Check if this is a public route or static asset
    const isPublicRoute = publicRoutes.includes(pathname) || 
                          pathname.startsWith('/api/auth/') ||
                          pathname.startsWith('/_next/') ||
                          pathname.startsWith('/favicon.ico') ||
                          pathname.startsWith('/.well-known/') ||
                          pathname.endsWith('.css') ||
                          pathname.endsWith('.js') ||
                          pathname.endsWith('.png') ||
                          pathname.endsWith('.jpg') ||
                          pathname.endsWith('.jpeg') ||
                          pathname.endsWith('.gif') ||
                          pathname.endsWith('.svg') ||
                          pathname.endsWith('.ico') ||
                          pathname.startsWith('/images/') ||
                          pathname.startsWith('/icons/') 
    
    // Don't apply middleware to public routes and static assets
    if (isPublicRoute) {
      const response = NextResponse.next()
      
      // Add CSP header for public routes
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://*.vercel-scripts.com; frame-ancestors 'none';"
      )
      
      return response
    }

    // Get session token from cookies
    const sessionToken = request.cookies.get("session")?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // For authenticated users, allow access to all routes
    // Role-based access control is handled at the page level
    const response = NextResponse.next()
    
    // Add CSP header for authenticated routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://*.vercel-scripts.com; frame-ancestors 'none';"
    )
    
    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of middleware error, allow the request to proceed
    const response = NextResponse.next()
    
    // Add basic CSP header even in error cases
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://*.vercel-scripts.com; frame-ancestors 'none';"
    )
    
    return response
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}