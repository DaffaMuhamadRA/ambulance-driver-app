"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordResetFormProps {
  token?: string
}

export default function PasswordResetForm({ token }: PasswordResetFormProps) {
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState(token || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(token ? "reset" : "request") // "request" or "reset"
  const router = useRouter()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Submitting password reset request with email:", email)
      const response = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      console.log("Password reset request response:", data)

      if (response.ok) {
        setSuccess(data.message)
        // In a real application, you would not show the token
        // This is just for testing purposes
        if (data.token) {
          setResetToken(data.token)
        }
      } else {
        setError(data.error || "Gagal meminta reset password")
      }
    } catch (error) {
      console.error("Password reset request error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Submitting password reset with token:", resetToken)
      const response = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: resetToken, password, confirmPassword }),
      })

      const data = await response.json()
      console.log("Password reset response:", data)

      if (response.ok) {
        setSuccess(data.message)
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.error || "Gagal mereset password")
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      {success && <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">{success}</div>}

      {step === "request" ? (
        <form onSubmit={handleRequestReset} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Masukkan email Anda"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? "Memproses..." : "Kirim Instruksi Reset"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Kembali ke Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <Label htmlFor="token" className="text-sm font-medium text-gray-700">
              Token Reset
            </Label>
            <Input
              id="token"
              name="token"
              type="text"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Masukkan token reset"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password Baru
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Masukkan password baru"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Konfirmasi Password Baru
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Konfirmasi password baru"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? "Memproses..." : "Reset Password"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep("request")}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Kirim Ulang Token
            </button>
          </div>
        </form>
      )}
    </div>
  )
}