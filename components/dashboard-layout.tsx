"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="h-screen bg-white font-sans">
      <div className="flex h-full w-full">
        {/* Sidebar Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-[#2d3748] text-white flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-center text-xl font-bold text-white bg-gradient-to-r from-[#77923b] to-[#becd4b]">
            Ambulan Rumah
          </div>

          <div className="p-4 flex flex-col items-center border-b border-gray-700">
            <img
              src="/placeholder.svg?height=80&width=80&text=AS"
              alt="User Avatar"
              className="w-20 h-20 rounded-full"
            />
            <h3 className="mt-2 font-semibold">{user.full_name}</h3>
            <div className="flex items-center mt-1">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm text-gray-400">Online</span>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>

            {user.role === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center mt-2 px-4 py-2 text-white bg-gradient-to-r from-[#becd4b] to-[#77923b] rounded-md shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 h-5 w-5"
                  >
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  Dashboard Admin
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center mt-1 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z" />
                  </svg>
                  Kelola Driver
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center mt-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 h-5 w-5"
                  >
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center mt-1 px-4 py-2 text-white bg-gradient-to-r from-[#becd4b] to-[#77923b] rounded-md shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3 h-5 w-5"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Aktivitas
                </Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white bg-transparent"
            >
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-gradient-to-r from-[#becd4b] to-[#77923b] shadow-sm text-white">
            <div className="h-16 flex items-center justify-between px-6">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-white focus:outline-none lg:hidden mr-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold hidden sm:block">
                  {user.role === "admin" ? "Dashboard Admin" : "Dashboard Aktivitas"}
                </h1>
              </div>
              <div className="flex items-center">
                <button className="text-white hover:bg-white/20 p-2 rounded-full focus:outline-none mr-4 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <div className="flex items-center">
                  <img
                    src="/placeholder.svg?height=32&width=32&text=AS"
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="ml-2 font-semibold text-sm hidden md:block">{user.full_name}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
