import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
// Note: We can't use getSession in middleware because it's an async server component function
// We'll need to verify sessions differently in middleware

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login", 
    "/api/auth/login", 
    "/api/test-db", 
    "/api/test-auth",
    "/api/test-login"
  ]

  // Check if this is a public route
  const isPublicRoute = publicRoutes.includes(pathname) || 
                        pathname.startsWith('/api/auth/') ||
                        pathname.startsWith('/_next/') ||
                        pathname.startsWith('/favicon.ico') ||
                        pathname.endsWith('.html') ||
                        pathname.startsWith('/images/') ||
                        pathname.startsWith('/icons/')
  
  console.log("Middleware checking path:", pathname)
  console.log("Is public route:", isPublicRoute)
  
  if (isPublicRoute) {
    console.log("Allowing public route")
    return NextResponse.next()
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get("session")?.value

  console.log("Session token from cookie:", sessionToken)

  if (!sessionToken) {
    console.log("No session token found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // For now, we'll allow all non-public routes if there's a session token
  // In a real application, we would verify the session token here
  console.log("Session token found, allowing request")
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}