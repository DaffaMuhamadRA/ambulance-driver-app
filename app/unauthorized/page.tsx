import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h1>
        <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/login">Kembali ke Login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
