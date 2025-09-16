
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LoginForm from "@/components/login-form"


interface User {
  id: number
  name: string
  email: string
  role: "driver" | "admin"
  status: string
  photo?: string
}

// Function to get current user from session
async function getCurrentUser(): Promise<User | null> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    // Use the session token to get the user directly from the database
    // This avoids issues with fetch calls not preserving cookies
    const { sql } = await import("@/lib/db")
    
    const result = await sql`
      SELECT 
        s.id, s.user_id, s.session_token, s.expires_at,
        u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expires_at > NOW() AND u.status = 'Active'
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.id_cms_privileges == 1 ? "admin" : "driver",
      status: row.status,
      photo: row.photo,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export default async function LoginPage() {
  // Check if user is already logged in by checking the session directly
  const user = await getCurrentUser()

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <img 
            src="/ambulan-logo.png"
            alt="Ambulan Cita Sehat Logo" 
            className="w-48 mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
          <p className="mt-2 text-gray-500">Silakan login untuk melanjutkan</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}