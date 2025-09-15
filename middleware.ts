import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth/login"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get session token from cookies
  const sessionToken = request.cookies.get("session")?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify session
  const session = await getSession(sessionToken)

  if (!session) {
    // Invalid session, redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("session")
    return response
  }

  // Role-based routing
  if (pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (pathname.startsWith("/dashboard") && session.user.role !== "driver") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // Redirect root to appropriate dashboard
  if (pathname === "/") {
    const redirectUrl = session.user.role === "admin" ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
