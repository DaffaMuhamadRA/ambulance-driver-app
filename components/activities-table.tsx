"use client"

import { useState, useEffect, useRef } from "react"
import type { Activity } from "@/lib/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface ActivitiesTableProps {
  activities: Activity[]
}

export default function ActivitiesTable({ activities }: ActivitiesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const tableRef = useRef<HTMLDivElement>(null)

  // Filter activities based on search term
  const filteredActivities = activities.filter(
    (activity) =>
      activity.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.dari.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ambulance.nopol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  // Scroll to top when currentPage changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentPage])

  const getDetailStyles = (detail: string) => {
    switch (detail) {
      case "Pasien":
        return { badge: "bg-blue-100 text-blue-800", border: "border-blue-400" }
      case "Jenazah":
        return { badge: "bg-yellow-100 text-yellow-800", border: "border-yellow-400" }
      case "Siaga Sehat":
        return { badge: "bg-green-100 text-green-800", border: "border-green-400" }
      case "Support Cabang":
        return { badge: "bg-purple-100 text-purple-800", border: "border-purple-400" }
      default:
        return { badge: "bg-gray-100 text-gray-800", border: "border-gray-400" }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // Remove seconds
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div ref={tableRef} className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Aktivitas</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                className="h-5 w-5 text-gray-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 focus:ring-green-500 focus:border-green-500 shadow-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Tanggal
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Ambulan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Detail
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Dari
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Tujuan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Driver
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Waktu
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Reward
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                KM
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Pemesanan
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentActivities.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                  Tidak ada aktivitas yang ditemukan.
                </td>
              </tr>
            ) : (
              currentActivities.map((activity) => {
                const styles = getDetailStyles(activity.detail)
                return (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="truncate" title={formatDate(activity.tgl_berangkat)}>
                        {formatDate(activity.tgl_berangkat)}
                      </div>
                      {activity.tgl_pulang && (
                        <div className="text-gray-500 text-xs truncate" title={`Pulang: ${formatDate(activity.tgl_pulang)}`}>
                          Pulang: {formatDate(activity.tgl_pulang)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="font-medium truncate" title={activity.ambulance.nopol}>
                        {activity.ambulance.nopol}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles.badge} truncate`}>
                        {activity.detail}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-32">
                      <div className="truncate" title={activity.dari}>
                        {activity.dari}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-32">
                      <div className="truncate" title={activity.tujuan}>
                        {activity.tujuan}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="truncate" title={activity.user.name}>
                        {activity.user.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="truncate" title={formatTime(activity.jam_berangkat)}>
                        {formatTime(activity.jam_berangkat)}
                      </div>
                      <div className="text-gray-500 text-xs truncate" title={formatTime(activity.jam_pulang)}>
                        {formatTime(activity.jam_pulang)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="truncate" title={activity.reward > 0 ? `Rp ${activity.reward.toLocaleString("id-ID")}` : "-"}>
                        {activity.reward > 0 ? `Rp ${activity.reward.toLocaleString("id-ID")}` : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-24">
                      <div className="truncate" title={`Awal: ${activity.km_awal}`}>
                        Awal: {activity.km_awal}
                      </div>
                      <div className="text-gray-500 text-xs truncate" title={`Akhir: ${activity.km_akhir}`}>
                        Akhir: {activity.km_akhir}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 w-32">
                      <div className="font-medium truncate" title={activity.nama_pemesan}>
                        {activity.nama_pemesan}
                      </div>
                      <div className="text-gray-500 text-xs truncate" title={activity.hp}>
                        {activity.hp}
                      </div>
                      <div className="text-gray-500 text-xs truncate" title={activity.nama_pm}>
                        {activity.nama_pm}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium w-20">
                      <div className="flex space-x-1">
                        <Link href={`/admin/activities/${activity.id}`}>
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50" title="Lihat Detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </Link>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50" title="Hapus">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> of{" "}
                <span className="font-medium">{filteredActivities.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-green-50 border-green-500 text-green-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}