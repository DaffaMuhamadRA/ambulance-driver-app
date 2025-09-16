import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result[0].current_time,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
    }, { status: 500 })
  }
}