import { NextResponse } from "next/server"
import { getSession } from "@/app/api/auth/session/route"
import { sql } from "@/lib/db"

export async function DELETE(request: Request) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { ids } = body
    
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty IDs array" },
        { status: 400 }
      )
    }
    
    // Validate that all IDs are numbers
    if (!ids.every(id => typeof id === 'number' && Number.isInteger(id) && id > 0)) {
      return NextResponse.json(
        { error: "All IDs must be positive integers" },
        { status: 400 }
      )
    }
    
    // Delete activities
    await sql`
      DELETE FROM ambulan_activity 
      WHERE id = ANY(${ids})
    `
    
    return NextResponse.json({ 
      message: `${ids.length} activities deleted successfully`,
      deletedCount: ids.length
    })
  } catch (error: any) {
    console.error("Error deleting activities:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}