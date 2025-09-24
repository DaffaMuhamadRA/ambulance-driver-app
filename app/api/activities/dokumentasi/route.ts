import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { validateNumericInput, validateStringInput } from "@/lib/validation"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { activityId, files } = await request.json()

    // Validate activityId
    const sanitizedActivityId = validateNumericInput(activityId)
    if (!sanitizedActivityId) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 })
    }

    // Validate files array
    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid files data" }, { status: 400 })
    }

    // Validate each file
    for (const file of files) {
      if (!file.filename || !file.url || !file.type || !file.size) {
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 })
      }
      
      // Sanitize file data
      const sanitizedFilename = validateStringInput(file.filename, 255)
      const sanitizedUrl = validateStringInput(file.url, 500)
      const sanitizedType = validateStringInput(file.type, 100)
      
      if (!sanitizedFilename || !sanitizedUrl || !sanitizedType) {
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 })
      }
    }

    // Insert documentation records
    const insertPromises = files.map(async (file: any) => {
      const sanitizedFilename = validateStringInput(file.filename, 255)
      const sanitizedUrl = validateStringInput(file.url, 500)
      const sanitizedType = validateStringInput(file.type, 100)
      const sanitizedSize = validateNumericInput(file.size)
      
      return await sql`
        INSERT INTO dokumentasi_activity (activity_id, file_name, file_url, file_type, file_size)
        VALUES (${sanitizedActivityId}, ${sanitizedFilename}, ${sanitizedUrl}, ${sanitizedType}, ${sanitizedSize})
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

    // Validate activityId
    const sanitizedActivityId = validateNumericInput(activityId)
    if (!sanitizedActivityId) {
      return NextResponse.json({ error: "Activity ID required" }, { status: 400 })
    }

    const result = await sql`
      SELECT id, activity_id, file_name, file_url, file_type, file_size, created_at
      FROM dokumentasi_activity 
      WHERE activity_id = ${sanitizedActivityId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching documentation:", error)
    return NextResponse.json({ error: "Failed to fetch documentation" }, { status: 500 })
  }
}