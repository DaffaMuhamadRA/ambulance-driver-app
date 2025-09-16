"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

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
  // Additional fields for detail view
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

export default function AdminActivityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const activityId = parseInt(params.id)
  
  useEffect(() => {
    if (isNaN(activityId)) {
      notFound()
      return
    }
    
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    // Check if user is admin
    if (user && user.role !== "admin") {
      router.push('/unauthorized')
      return
    }
    
    if (user) {
      fetchActivity()
    }
  }, [user, loading, activityId])
  
  const fetchActivity = async () => {
    try {
      setLoadingActivity(true)
      const response = await fetch(`/api/admin/activities/${activityId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
          return
        }
        throw new Error('Failed to fetch activity')
      }
      
      const data = await response.json()
      setActivity(data)
    } catch (err) {
      setError('Failed to load activity details')
      console.error(err)
    } finally {
      setLoadingActivity(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    return timeString.slice(0, 5) // Remove seconds
  }

  if (loading || loadingActivity) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button 
          onClick={() => router.push('/admin')} 
          className="mt-4"
          variant="outline"
        >
          Kembali ke Dashboard
        </Button>
      </div>
    )
  }

  if (!activity) {
    notFound()
    return null
  }

  // Only render DashboardLayout when we have a user
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Detail Aktivitas</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-gray-900 font-semibold">Aktivitas</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Informasi Aktivitas</h2>
              <Link href="/admin">
                <Button variant="outline" className="flex items-center gap-2">
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
                    className="h-4 w-4"
                  >
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  Kembali
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Berangkat</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.tgl_berangkat ? formatDate(activity.tgl_berangkat) : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Pulang</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.tgl_pulang ? formatDate(activity.tgl_pulang) : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ambulan (No Plat)</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.ambulance.nopol || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Detail</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.detail || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jam Berangkat</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.jam_berangkat ? formatTime(activity.jam_berangkat) : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jam Pulang</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.jam_pulang ? formatTime(activity.jam_pulang) : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jenis</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.tipe || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Asisten Luar Kota</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.asisten_luar_kota || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Area</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.area || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dari</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.dari || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tujuan</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.tujuan || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Driver</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.user.name || "-"}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nama Pemesan</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.nama_pemesan || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">HP</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.hp || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nama PM</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.nama_pm || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Alamat PM</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.alamat_pm || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Jenis Kelamin PM</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.jenis_kelamin_pm || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Usia PM</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.usia_pm || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Asnaf</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.id_asnaf || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">NIK</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.nik || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">No KK</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.no_kk || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tempat Lahir</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.tempat_lahir || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tanggal Lahir</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.tgl_lahir ? formatDate(activity.tgl_lahir) : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status Marital</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.status_marital || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Kegiatan</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.kegiatan || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rumpun Program</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.rumpun_program || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">KM Awal</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.km_awal || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">KM Akhir</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.km_akhir || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Biaya Antar</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.reward > 0 ? `Rp ${activity.reward.toLocaleString("id-ID")}` : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Infaq Dibayar</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {(activity.biaya_dibayar || 0) > 0 ? `Rp ${(activity.biaya_dibayar || 0).toLocaleString("id-ID")}` : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Infaq</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {(activity.infaq || 0) > 0 ? `Rp ${(activity.infaq || 0).toLocaleString("id-ID")}` : "-"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Diagnosa Sakit</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.diagnosa_sakit || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Agama</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.agama || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}