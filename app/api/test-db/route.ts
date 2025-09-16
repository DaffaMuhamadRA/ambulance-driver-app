import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test database connection by querying a simple table
    const result = await sql`SELECT 1 as connected`;
    
    if (result.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Database connection successful",
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Database query returned no results"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Database connection failed",
      details: error.message
    }, { status: 500 });
  }
}