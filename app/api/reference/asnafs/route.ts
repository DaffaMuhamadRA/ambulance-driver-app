import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const asnafs = await sql`
      SELECT id, asnaf FROM asnaf ORDER BY asnaf
    `
    
    return NextResponse.json(asnafs)
  } catch (error) {
    console.error("Error fetching asnafs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}