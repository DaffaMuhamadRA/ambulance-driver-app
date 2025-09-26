import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const drivers = await sql`
      SELECT 
        cu.id, 
        cu.name,
        d.status
      FROM cms_users cu
      LEFT JOIN driver d ON cu.email = d.username
      WHERE cu.id_cms_privileges != 1 
      ORDER BY cu.name
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