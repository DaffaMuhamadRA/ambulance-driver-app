"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on user role
        router.push(data.user.role === "admin" ? "/admin" : "/dashboard")
        router.refresh()
      } else {
        setError(data.error || "Login gagal")
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

      <div>
        <Label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username / Email
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Masukkan username atau email"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Masukkan password"
        />
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {isLoading ? "Memproses..." : "Login"}
        </Button>
      </div>
    </form>
  )
}
