import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const rewards = await sql`
      SELECT id, jenis, tipe, reward FROM reward_pengantaran ORDER BY jenis, tipe
    `
    
    return NextResponse.json(rewards)
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
