import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name}`

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      return {
        url: blob.url,
        filename: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
