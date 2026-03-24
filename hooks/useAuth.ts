import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/config"

interface User {
  id: number
  name: string
  email: string
  role: "driver" | "admin"
  status: string
  photo?: string
  id_driver?: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user session from:", `${BASE_URL}/api/auth/session`)
        const response = await fetch(`${BASE_URL}/api/auth/session`)
        
        // Check if the response is successful
        if (!response.ok) {
          console.error("Failed to fetch user session:", response.status, response.statusText)
          setUser(null)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log("Session data received:", data)
        
        // Check if we have a user in the response
        if (data.user) {
          console.log("User authenticated:", data.user)
          setUser(data.user)
        } else {
          console.log("No user in session data")
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        // Set user to null in case of error
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
