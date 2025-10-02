"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import PasswordResetForm from "@/components/password-reset-form"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || undefined

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
          <h2 className="text-2xl font-bold text-gray-800">
            {token ? "Reset Password" : "Lupa Password"}
          </h2>
          <p className="mt-2 text-gray-500">
            {token 
              ? "Masukkan password baru Anda" 
              : "Masukkan email Anda untuk menerima instruksi reset password"}
          </p>
        </div>
        <PasswordResetForm token={token} />
      </div>
    </div>
  )
}