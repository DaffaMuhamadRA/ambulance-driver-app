import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"
import { validateStringInput } from "@/lib/validation"

export interface User {
  id: number
  name: string
  email: string
  role: "driver" | "admin"
  status: string
  photo?: string
  id_driver?: number
}

export interface Session {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
}

// Get session by token
export async function getSession(token: string): Promise<(Session & { user: User }) | null> {
  try {
    // Validate token
    const sanitizedToken = validateStringInput(token, 255, 1);
    if (!sanitizedToken) {
      return null;
    }

    const result = await sql`
      SELECT 
        s.id, s.user_id, s.session_token, s.expires_at,
        u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo, u.id_driver
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.session_token = ${sanitizedToken} AND s.expires_at > NOW() AND u.status = 'Active'
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id,
      user_id: row.user_id,
      session_token: row.session_token,
      expires_at: new Date(row.expires_at),
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        role: row.id_cms_privileges == 1 ? "admin" : "driver",
        status: row.status,
        photo: row.photo,
        id_driver: row.id_driver,
      },
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Get current user from session
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) return NextResponse.json({ user: null })

    // Validate token
    const sanitizedToken = validateStringInput(sessionToken, 255, 1);
    if (!sanitizedToken) {
      return NextResponse.json({ user: null })
    }

    const session = await getSession(sanitizedToken)
    return NextResponse.json({ user: session?.user || null })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ user: null })
  }
}