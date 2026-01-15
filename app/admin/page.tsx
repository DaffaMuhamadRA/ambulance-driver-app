"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import DashboardLayout from "@/components/dashboard-layout"
import ActivitiesTable from "@/components/activities-table"
import ActivityFilter, { ActivityFilterRef } from "@/components/activity-filter"
import { Button } from "@/components/ui/button"

interface Activity {
  id: number
  tgl_berangkat: string
  tgl_pulang: string
  detail: string
  dari: string
  tujuan: string
  jam_berangkat: string
  jam_pulang: string
  tipe: string
  reward: number
  km_awal: number
  km_akhir: number
  nama_pemesan: string
  hp: string
  nama_pm: string
  area?: string
  asisten_luar_kota?: string
  alamat_pm?: string
  jenis_kelamin_pm?: string
  usia_pm?: number
  nik?: string
  no_kk?: string
  tempat_lahir?: string
  tgl_lahir?: string
  status_marital?: string
  kegiatan?: string
  rumpun_program?: string
  diagnosa_sakit?: string
  agama?: string
  infaq?: number
  biaya_dibayar?: number
  id_asnaf?: number
  ambulance: {
    id: number
    nopol: string
    kode: string
  }
  user: {
    id: number
    name: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [initialPage, setInitialPage] = useState(1)
  const [filters, setFilters] = useState({})
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const filterRef = useRef<ActivityFilterRef>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
    
    // Check if user is driver (should be redirected)
    if (user && user.role !== "admin") {
      router.push("/dashboard")
      return
    }
  }, [user, loading]) // Removed filters from dependencies here

  // Get the page parameter from URL on initial load
  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10)
      if (!isNaN(pageNum) && pageNum > 0) {
        setInitialPage(pageNum)
      }
    }
  }, [searchParams])

  // Fetch activities when user or filters change
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAdminActivities()
    }
  }, [user, filters]) // Added filters as dependency

  const fetchAdminActivities = async () => {
    try {
      setActivitiesLoading(true)
      // Include filters in the API request
      const filterParams = new URLSearchParams(filters as any).toString()
      const response = await fetch(`/api/admin/activities${filterParams ? `?${filterParams}` : ''}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        console.error("Failed to fetch activities")
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  // Function to refresh activities data
  const refreshActivities = () => {
    fetchAdminActivities()
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setInitialPage(1) // Reset to first page when filters change
    setFilters(newFilters)
  }

  if (loading || activitiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user}>
      <div className="pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
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
              className="h-6 w-6 text-gray-700"
            >
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span> <span className="text-gray-900 font-semibold">Admin</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {/* Filter Component */}
        <ActivityFilter 
          ref={filterRef} 
          isAdmin 
          onFilterChange={handleFilterChange}
          isFilterVisible={isFilterVisible}
          setIsFilterVisible={setIsFilterVisible}
        />
        
        <ActivitiesTable 
          activities={activities} 
          initialPage={initialPage}
          isAdmin={true}
          onRefresh={refreshActivities}
          filterIcon={
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
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
                className="h-5 w-5"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          }
        />
      </div>
    </DashboardLayout>
  )
}
