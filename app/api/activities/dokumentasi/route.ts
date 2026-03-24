import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { validateNumericInput, validateStringInput } from "@/lib/validation"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { activityId, files } = await request.json()
    console.log("Received data:", { activityId, files });

    // Validate activityId
    const sanitizedActivityId = validateNumericInput(activityId)
    if (!sanitizedActivityId) {
      return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 })
    }

    // Validate files array
    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "Invalid files data" }, { status: 400 })
    }

    // Validate each file - only require url since that's what we store in the database
    for (const file of files) {
      if (!file.url) {
        return NextResponse.json({ error: "Invalid file data: URL is required" }, { status: 400 })
      }
      
      // Sanitize URL
      const sanitizedUrl = validateStringInput(file.url, 500)
      if (!sanitizedUrl) {
        return NextResponse.json({ error: "Invalid file URL" }, { status: 400 })
      }
    }

    // Insert documentation records
    const insertPromises = files.map(async (file: any) => {
      const sanitizedUrl = validateStringInput(file.url, 500)
      
      console.log("Inserting documentation:", { 
        sanitizedActivityId, 
        sanitizedUrl
      });
      
      return await sql`
        INSERT INTO dokumentasi_activity (id_activity, url)
        VALUES (${sanitizedActivityId}, ${sanitizedUrl})
        RETURNING id, id_activity, url, created_at
      `
    })

    const results = await Promise.all(insertPromises)
    console.log("Insert results:", results);

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
      SELECT id, id_activity, url, created_at
      FROM dokumentasi_activity 
      WHERE id_activity = ${sanitizedActivityId}
      ORDER BY created_at DESC
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching documentation:", error)
    return NextResponse.json({ error: "Failed to fetch documentation" }, { status: 500 })
  }
}
