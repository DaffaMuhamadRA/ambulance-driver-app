import { NextResponse } from "next/server"
import { getActivities } from "@/lib/activities"
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
    
    if (!session || session.user.role !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Use id_driver from the user session
    // Log the values for debugging
    console.log("Session user:", session.user)
    console.log("Using driver ID:", session.user.id_driver)
    
    const driverId = session.user.id_driver
    if (!driverId) {
      return NextResponse.json({ error: "Driver ID not found in user session" }, { status: 400 })
    }
    
    const activities = await getActivities(driverId)
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching driver activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
