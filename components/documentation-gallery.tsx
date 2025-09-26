"use client"

import { useState, useEffect } from "react"
import { X, Download, Eye, FileText, ImageIcon, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define the documentation interface to match the actual data structure
interface Documentation {
  id: number
  url: string
  created_at: string
  id_activity?: number // Optional as it might not be present in all cases
}

interface DocumentationGalleryProps {
  activityId: number
  documentation?: Documentation[]
  onRemove?: (id: number) => void // Optional callback for removing documentation
  editable?: boolean // Flag to indicate if the gallery is editable
  softDeletedDocumentation?: number[] // Documents marked for deletion
  onUndoDelete?: (id: number) => void // Callback for undoing deletion
  onDeleteSelected?: (ids: number[]) => void // Callback for deleting selected documents
}

export default function DocumentationGallery({ 
  activityId, 
  documentation, 
  onRemove,
  editable = false,
  softDeletedDocumentation = [],
  onUndoDelete,
  onDeleteSelected
}: DocumentationGalleryProps) {
  const [localDocumentation, setLocalDocumentation] = useState<Documentation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedDocs, setSelectedDocs] = useState<Set<number>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // If documentation is provided as prop, use it directly
    if (documentation) {
      setLocalDocumentation(documentation)
      setLoading(false)
    } else {
      // Otherwise fetch from API
      fetchDocumentation()
    }
  }, [activityId, documentation])

  const fetchDocumentation = async () => {
    try {
      const response = await fetch(`/api/activities/dokumentasi?activityId=${activityId}`)
      if (response.ok) {
        const data = await response.json()
        setLocalDocumentation(data)
      }
    } catch (error) {
      console.error("Error fetching documentation:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isImage = (url: string) => {
    // Simple check based on file extension
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    return imageExtensions.some(ext => url.toLowerCase().includes(ext))
  }

  const getFileIcon = (url: string) => {
    if (isImage(url)) {
      return <ImageIcon className="w-5 h-5" />
    }
    return <FileText className="w-5 h-5" />
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename || `document-${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const toggleSelectDoc = (id: number) => {
    const newSelected = new Set(selectedDocs)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDocs(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedDocs.size === localDocumentation.length) {
      // If all are selected, deselect all
      setSelectedDocs(new Set())
    } else {
      // If not all are selected, select all
      setSelectedDocs(new Set(localDocumentation.map(doc => doc.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedDocs.size > 0) {
      onDeleteSelected(Array.from(selectedDocs))
      setSelectedDocs(new Set())
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Only show "Tidak ada dokumentasi" message when not in edit mode and there's no documentation
  if (localDocumentation.length === 0 && !editable) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Tidak ada dokumentasi untuk aktivitas ini</p>
      </div>
    )
  }

  // If in edit mode and no documentation, still show the component for adding new documentation
  if (localDocumentation.length === 0 && editable) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Belum ada dokumentasi. Tambahkan dokumentasi baru menggunakan form di atas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dokumentasi Aktivitas</h3>

      {/* Select All Checkbox and Delete Button */}
      {editable && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={localDocumentation.length > 0 && selectedDocs.size === localDocumentation.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
            <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
              Pilih Semua
            </label>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={selectedDocs.size === 0}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus yang Dipilih ({selectedDocs.size})
          </Button>
        </div>
      )}

      {/* File List */}
      <div className="space-y-3">
        {localDocumentation.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {editable && (
                <input
                  type="checkbox"
                  checked={selectedDocs.has(doc.id)}
                  onChange={() => toggleSelectDoc(doc.id)}
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
              )}
              <div className="text-gray-500">{getFileIcon(doc.url)}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {doc.url.split('/').pop() || `Document ${doc.id}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(doc.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isImage(doc.url) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(doc.url)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc.url, `document-${doc.id}`)}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="w-4 h-4" />
              </Button>
              {editable && onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(doc.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Soft Deleted Documentation Section */}
      {softDeletedDocumentation.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dokumentasi yang ingin dihapus</h3>
          <div className="space-y-3">
            {softDeletedDocumentation.map((docId) => {
              const doc = (documentation || localDocumentation).find(d => d.id === docId);
              return doc ? (
                <div key={`soft-delete-${docId}`} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-500">{getFileIcon(doc.url)}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-through">
                        {doc.url.split('/').pop() || `Document ${doc.id}`}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {editable && onUndoDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUndoDelete(docId)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Penghapusan</h3>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus {selectedDocs.size} dokumen yang dipilih? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  handleDeleteSelected()
                  setShowDeleteConfirm(false)
                }}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Documentation"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}