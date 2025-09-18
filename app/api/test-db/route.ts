import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Test the database connection
    const result = await sql`SELECT NOW() as current_time`;
    
    // Test querying cms_users table
    const users = await sql`SELECT id, name, email FROM cms_users LIMIT 3`;
    
    return NextResponse.json({
      success: true,
      currentTime: result[0].current_time,
      users: users,
      env: {
        PGHOST: process.env.PGHOST || 'Not set',
        PGDATABASE: process.env.PGDATABASE || 'Not set',
        PGUSER: process.env.PGUSER || 'Not set',
        PGPASSWORD: process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set',
      }
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      env: {
        PGHOST: process.env.PGHOST || 'Not set',
        PGDATABASE: process.env.PGDATABASE || 'Not set',
        PGUSER: process.env.PGUSER || 'Not set',
        PGPASSWORD: process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set',
      }
    }, { status: 500 });
  }
}
