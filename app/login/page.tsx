"use client"

import { useState, useEffect } from "react"
import { redirect, useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "admin" ? "/admin" : "/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // If user is already logged in, don't show the login page
  if (user) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <img 
            src="/ambulan-logo.png"
            alt="Ambulan Cita Sehat Logo" 
            className="w-48 mx-auto mb-6"
            onError={(e) => {
              // Fallback to placeholder if logo fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-user.jpg";
            }}
          />
          <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
          <p className="mt-2 text-gray-500">Silakan login untuk melanjutkan</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}