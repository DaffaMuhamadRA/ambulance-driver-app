import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const kantors = await sql`
      SELECT id, kantor FROM kantor ORDER BY kantor
    `
    
    return NextResponse.json(kantors)
  } catch (error) {
    console.error("Error fetching kantors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}