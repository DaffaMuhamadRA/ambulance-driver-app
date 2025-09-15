import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    // Clear cookie
    cookieStore.delete("session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
