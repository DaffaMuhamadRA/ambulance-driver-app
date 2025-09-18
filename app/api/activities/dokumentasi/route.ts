import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { activityId, files } = await request.json()

    if (!activityId || !files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Insert documentation records
    const insertPromises = files.map(async (file: any) => {
      return await sql`
        INSERT INTO dokumentasi_activity (activity_id, file_name, file_url, file_type, file_size)
        VALUES (${activityId}, ${file.filename}, ${file.url}, ${file.type}, ${file.size})
        RETURNING *
      `
    })

    const results = await Promise.all(insertPromises)

    return NextResponse.json({
      success: true,
      dokumentasi: results.flat(),
    })
  } catch (error) {
    console.error("Error saving documentation:", error)
    return NextResponse.json({ error: "Failed to save documentation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get("activityId")

    if (!activityId) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 })
    }

    const dokumentasi = await sql`
      SELECT * FROM dokumentasi_activity 
      WHERE activity_id = ${activityId}
      ORDER BY uploaded_at DESC
    `

    return NextResponse.json({ dokumentasi })
  } catch (error) {
    console.error("Error fetching documentation:", error)
    return NextResponse.json({ error: "Failed to fetch documentation" }, { status: 500 })
  }
}
