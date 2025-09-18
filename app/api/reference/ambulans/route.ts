import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const ambulans = await sql`
      SELECT id, nopol FROM ambulan ORDER BY nopol
    `
    
    return NextResponse.json(ambulans)
  } catch (error) {
    console.error("Error fetching ambulans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
