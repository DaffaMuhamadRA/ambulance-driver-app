import { NextResponse } from "next/server"
import { getAllActivities } from "@/lib/activities"
import { getSession } from "@/app/api/auth/session/route"

export async function GET(request: Request) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie: string) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const activities = await getAllActivities()
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching admin activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}