import { NextResponse } from "next/server"
import { getSession } from "@/app/api/auth/session/route"

export async function GET(request: Request) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json({ user: null })
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json({ user: null })
    }
    
    return NextResponse.json({ user: session.user })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json({ user: null })
  }
}
