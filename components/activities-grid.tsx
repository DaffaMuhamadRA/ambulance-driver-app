"use client"

import { useState, useEffect, useRef } from "react"
import type { DashboardActivity as Activity } from "@/lib/activities"  // Changed to DashboardActivity
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmationModal from "@/components/confirmation-modal"
import AlertModal from "@/components/alert-modal"

interface ActivitiesGridProps {
  activities: Activity[]
  isAdmin?: boolean
  onAddNew?: () => void
  initialPage?: number // Add initialPage prop
}

export default function ActivitiesGrid({ activities, isAdmin = false, onAddNew, initialPage = 1 }: ActivitiesGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(initialPage) // Use initialPage for initial state
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentActivities, setCurrentActivities] = useState<Activity[]>(activities)
  // Modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertModalTitle, setAlertModalTitle] = useState("")
  const [alertModalMessage, setAlertModalMessage] = useState("")
  const [alertModalType, setAlertModalType] = useState<"info" | "success" | "warning" | "error">("info")
  const [deleteAction, setDeleteAction] = useState<() => void>(() => () => {})
  const gridRef = useRef<HTMLDivElement>(null)

  // Filter activities based on search term
  const filteredActivities = currentActivities.filter(
    (activity) =>
      (activity.detail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.dari || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.tujuan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.ambulance.nopol || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage)

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = async (activityId: number) => {
    // Show confirmation modal instead of confirm()
    setDeleteAction(() => () => performDelete(activityId))
    setConfirmModalOpen(true)
  }

  const performDelete = async (activityId: number) => {
    try {
      // Determine which API endpoint to use based on isAdmin flag
      const apiEndpoint = isAdmin ? `/api/admin/activities/${activityId}` : `/api/activities/${activityId}`
      
      const response = await fetch(apiEndpoint, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove the deleted activity from the current activities list
        setCurrentActivities(prevActivities => 
          prevActivities.filter(activity => activity.id !== activityId)
        )
        
        // Reset to first page if we're on an empty page
        if (displayedActivities.length === 1 && currentPage > 1) {
          setCurrentPage(1)
        }
      } else {
        const errorData = await response.json()
        // Show alert modal instead of alert()
        setAlertModalTitle("Gagal Menghapus")
        setAlertModalMessage(`Gagal menghapus aktivitas: ${errorData.error}`)
        setAlertModalType("error")
        setAlertModalOpen(true)
      }
    } catch (error) {
      console.error("Error deleting activity:", error)
      // Show alert modal instead of alert()
      setAlertModalTitle("Kesalahan")
      setAlertModalMessage("Terjadi kesalahan saat menghapus aktivitas")
      setAlertModalType("error")
      setAlertModalOpen(true)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    
    // Show confirmation modal instead of confirm()
    setDeleteAction(() => performBulkDelete)
    setConfirmModalOpen(true)
  }

  const performBulkDelete = async () => {
    try {
      // Delete each selected activity
      const deletePromises = Array.from(selectedIds).map(id => {
        const apiEndpoint = isAdmin ? `/api/admin/activities/${id}` : `/api/activities/${id}`
        return fetch(apiEndpoint, {
          method: 'DELETE',
        })
      })
      
      const responses = await Promise.all(deletePromises)
      const failedDeletes = responses.filter(response => !response.ok)
      
      if (failedDeletes.length === 0) {
        // All deletions successful
        // Remove the deleted activities from the current activities list
        setCurrentActivities(prevActivities => 
          prevActivities.filter(activity => !selectedIds.has(activity.id))
        )
        
        // Clear selection
        setSelectedIds(new Set())
        
        // Reset to first page if we're on an empty page
        if (displayedActivities.length === selectedIds.size && currentPage > 1) {
          setCurrentPage(1)
        }
      } else {
        // Show alert modal instead of alert()
        setAlertModalTitle("Gagal Menghapus")
        setAlertModalMessage(`Gagal menghapus ${failedDeletes.length} dari ${selectedIds.size} aktivitas.`)
        setAlertModalType("error")
        setAlertModalOpen(true)
      }
    } catch (error) {
      console.error("Error deleting activities:", error)
      // Show alert modal instead of alert()
      setAlertModalTitle("Kesalahan")
      setAlertModalMessage("Terjadi kesalahan saat menghapus aktivitas")
      setAlertModalType("error")
      setAlertModalOpen(true)
    }
  }

  const handleCardClick = (activityId: number) => {
    router.push(`/activities/${activityId}?page=${currentPage}`)
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            {selectedIds.size > 0 && (
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuItem onClick={handleBulkDelete}>
                  Hapus Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
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

      {/* Pagination controls above the grid - visible only on mobile (1 card per row) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mb-4 pt-2 border-t border-gray-200 space-x-4 text-sm sm:hidden">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 shadow-sm"
          >
            Previous
          </Button>
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {displayedActivities.map((activity) => {
          const styles = getDetailStyles(activity.detail || "")
          const isSelected = selectedIds.has(activity.id)

          return (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-px"
            >
              <div 
                className="p-3 flex-grow flex flex-col cursor-pointer bg-white hover:bg-gray-50 transition-colors rounded-t-lg"
                onClick={() => handleCardClick(activity.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-gray-500 text-xs">{formatDate(activity.tgl_berangkat || "")}</p>
                    <p className="font-bold text-gray-800 text-sm">{activity.ambulance.nopol || ""}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(activity.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    onClick={(e) => e.stopPropagation()} // Mencegah click dari propagating ke parent div
                  />
                </div>
                {/* Simplified mobile view with just 2 rows of key information */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <p className="font-medium text-gray-900">Dari:</p>
                    <p className="text-gray-700 truncate">{activity.dari || ""}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Tujuan:</p>
                    <p className="text-gray-700 truncate">{activity.tujuan || ""}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-3 py-2 flex items-center justify-between rounded-b-lg border-t border-gray-200">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.badge}`}>{activity.detail || ""}</span>
                <div className="flex items-center space-x-1">
                  <div className="text-xs text-gray-600 mr-2">
                    {formatTime(activity.jam_berangkat || "")} - {formatTime(activity.jam_pulang || "")}
                  </div>
                  <button
                    className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                    title="Lihat Detail"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(activity.id)
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
                  <Link href={`/activities/${activity.id}/edit`}>
                    <button
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation()
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
                  </Link>
                  <button
                    className="p-1.5 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Hapus"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(activity.id)
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
          )
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada aktivitas yang ditemukan.</p>
        </div>
      )}

      {/* Pagination controls below the grid */}
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
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={deleteAction}
        title="Konfirmasi Hapus"
        message={selectedIds.size > 1 
          ? `Apakah Anda yakin ingin menghapus ${selectedIds.size} aktivitas? Tindakan ini tidak dapat dibatalkan.` 
          : "Apakah Anda yakin ingin menghapus aktivitas ini? Tindakan ini tidak dapat dibatalkan."}
        confirmText="Ya"
        cancelText="Batal"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title={alertModalTitle}
        message={alertModalMessage}
        type={alertModalType}
      />
    </div>
  )
}