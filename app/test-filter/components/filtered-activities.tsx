"use client"

import { useState, useEffect } from "react"

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

export default function FilteredActivities({ filters }: { filters: any }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchFilteredActivities()
    } else {
      setActivities([])
    }
  }, [filters])

  const fetchFilteredActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Bangun query string dari filter
      const queryParams = new URLSearchParams(filters).toString()
      
      // Panggil API admin activities dengan filter
      const response = await fetch(`/api/admin/activities?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Gagal mengambil data aktivitas")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data")
      console.error("Error fetching filtered activities:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
        <p className="text-gray-500">
          {Object.keys(filters).length > 0 
            ? "Tidak ada aktivitas yang sesuai dengan filter" 
            : "Isi filter dan klik Terapkan untuk melihat hasil"}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Hasil Filter ({activities.length} aktivitas)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambulan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dari</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tujuan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(activity.tgl_berangkat)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.ambulance.nopol}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.detail}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.dari}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.tujuan}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {activity.user.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}