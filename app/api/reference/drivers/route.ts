import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const drivers = await sql`
      SELECT id, name FROM cms_users WHERE id_cms_privileges != 1 ORDER BY name
    `
    
    return NextResponse.json(drivers)
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}