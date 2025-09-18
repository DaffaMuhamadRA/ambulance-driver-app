import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const details = await sql`
      SELECT id, detail_antar FROM detail_antar ORDER BY detail_antar
    `
    
    return NextResponse.json(details)
  } catch (error) {
    console.error("Error fetching details:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
