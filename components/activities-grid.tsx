"use client"

import { useState, useEffect, useRef } from "react"
import type { Activity } from "@/lib/activities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ActivitiesGridProps {
  activities: Activity[]
  isAdmin?: boolean
  onAddNew?: () => void
}

export default function ActivitiesGrid({ activities, isAdmin = false, onAddNew }: ActivitiesGridProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)

  // Filter activities based on search term
  const filteredActivities = activities.filter(
    (activity) =>
      activity.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.dari.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ambulance.nopol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

  // Scroll to top when currentPage changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth" })
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
      default:
        return { badge: "bg-gray-100 text-gray-800", border: "border-gray-400" }
    }
  }

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds)
    if (checked) {
      newSelectedIds.add(id)
    } else {
      newSelectedIds.delete(id)
    }
    setSelectedIds(newSelectedIds)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // Remove seconds
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <div ref={gridRef}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Link 
            href="/activities/create"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition-colors"
          >
            + Tambah Data
          </Link>
          <Button
            variant="outline"
            disabled={selectedIds.size === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm ${
              selectedIds.size > 0
                ? "text-gray-700 bg-gray-50 hover:bg-gray-100"
                : "text-gray-400 bg-white cursor-not-allowed"
            }`}
          >
            Bulk Actions {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </div>

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
            <option value="6">6</option>
            <option value="10">10</option>
            <option value="14">14</option>
            <option value="18">18</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {currentActivities.map((activity) => {
          const styles = getDetailStyles(activity.detail)
          const isSelected = selectedIds.has(activity.id)

          return (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-px"
            >
              <div className="flex flex-col h-full">
                <div 
                  className="p-3 flex-grow flex flex-col cursor-pointer bg-white hover:bg-gray-50 transition-colors rounded-t-lg"
                  onClick={() => router.push(`/activities/${activity.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.badge}`}>{activity.detail}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleCheckboxChange(activity.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      onClick={(e) => e.stopPropagation()} // Mencegah click dari propagating ke parent div
                    />
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs">{formatDate(activity.tgl_berangkat)}</p>
                    <p className="font-bold text-gray-800 text-sm">{activity.ambulance.nopol}</p>
                  </div>
                  {/* Simplified mobile view with just 2 rows of key information */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-gray-900">Dari:</p>
                      <p className="text-gray-700 truncate">{activity.dari}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tujuan:</p>
                      <p className="text-gray-700 truncate">{activity.tujuan}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between rounded-b-lg border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    {formatTime(activity.jam_berangkat)} - {formatTime(activity.jam_pulang)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                      title="Lihat Detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/activities/${activity.id}`);
                      }}
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
                        className="h-4 w-4"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add edit functionality here if needed
                      }}
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
                        className="h-4 w-4"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                      title="Hapus"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add delete functionality here if needed
                      }}
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
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada aktivitas yang ditemukan.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 pt-4 border-t border-gray-200 space-x-4 text-sm">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 shadow-sm"
          >
            Previous
          </Button>
          <span className="font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 shadow-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}