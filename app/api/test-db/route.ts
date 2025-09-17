import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const test = await sql`SELECT NOW() as current_time`
    console.log("Database connection test:", test)
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' 
      ORDER BY ordinal_position
    `
    console.log("Table columns:", columns)
    
    return NextResponse.json({ 
      success: true, 
      currentTime: test[0].current_time,
      columns: columns 
    })
  } catch (error: any) {
    console.error("Database test error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}