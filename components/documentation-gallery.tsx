"use client"

import { useState, useEffect } from "react"
import { X, Download, Eye, FileText, ImageIcon } from "lucide-react"
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
}

export default function DocumentationGallery({ 
  activityId, 
  documentation, 
  onRemove,
  editable = false 
}: DocumentationGalleryProps) {
  const [localDocumentation, setLocalDocumentation] = useState<Documentation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

      {/* File List */}
      <div className="space-y-3">
        {localDocumentation.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-gray-500">{getFileIcon(doc.url)}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Document {doc.id}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(doc.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isImage(doc.url) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(doc.url)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc.url, `document-${doc.id}`)}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="w-4 h-4" />
              </Button>
              {editable && onRemove && (
                <Button
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full">
            <button
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