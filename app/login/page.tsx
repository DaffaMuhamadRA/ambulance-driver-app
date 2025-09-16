import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  // Redirect if already logged in
  const user = await getCurrentUser()
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <img src="/ambulan-logo-cita-sehat.png" alt="Ambulan Cita Sehat Logo" className="w-48 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
          <p className="mt-2 text-gray-500">Silakan login untuk melanjutkan</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
