import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: "driver" | "admin"
  is_active: boolean
  phone?: string
  address?: string
  driver_license?: string
}

export interface Session {
  id: number
  user_id: number
  session_token: string
  expires_at: Date
}

// Generate a secure session token
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Create a new session
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await sql`
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt})
  `

  return sessionToken
}

// Get session by token
export async function getSession(token: string): Promise<(Session & { user: User }) | null> {
  const result = await sql`
    SELECT 
      s.id, s.user_id, s.session_token, s.expires_at,
      u.id as user_id, u.username, u.email, u.full_name, u.role, u.is_active, u.phone, u.address, u.driver_license
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${token} AND s.expires_at > NOW() AND u.is_active = true
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
      username: row.username,
      email: row.email,
      full_name: row.full_name,
      role: row.role as "driver" | "admin",
      is_active: row.is_active,
      phone: row.phone,
      address: row.address,
      driver_license: row.driver_license,
    },
  }
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const result = await sql`
    SELECT id, username, email, full_name, password_hash, role, is_active, phone, address, driver_license
    FROM users 
    WHERE (username = ${username} OR email = ${username}) AND is_active = true
  `

  if (result.length === 0) return null

  const user = result[0]
  const isValidPassword = await bcrypt.compare(password, user.password_hash)

  if (!isValidPassword) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role as "driver" | "admin",
    is_active: user.is_active,
    phone: user.phone,
    address: user.address,
    driver_license: user.driver_license,
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  const session = await getSession(sessionToken)
  return session?.user || null
}

// Require authentication
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Require specific role
export async function requireRole(role: "driver" | "admin"): Promise<User> {
  const user = await requireAuth()
  if (user.role !== role) {
    redirect("/unauthorized")
  }
  return user
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE session_token = ${token}`
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`
}
