import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    PGHOST: process.env.PGHOST || 'Not set',
    PGDATABASE: process.env.PGDATABASE || 'Not set',
    PGUSER: process.env.PGUSER || 'Not set',
    PGPASSWORD: process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set',
    PGSSLMODE: process.env.PGSSLMODE || 'Not set',
    PGCHANNELBINDING: process.env.PGCHANNELBINDING || 'Not set',
  });
}