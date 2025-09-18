"use client"

import { useState, useEffect } from "react"
import { X, Download, Eye, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Documentation {
  id: number
  activity_id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_at: string
}

interface DocumentationGalleryProps {
  activityId: number
}

export default function DocumentationGallery({ activityId }: DocumentationGalleryProps) {
  const [documentation, setDocumentation] = useState<Documentation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchDocumentation()
  }, [activityId])

  const fetchDocumentation = async () => {
    try {
      const response = await fetch(`/api/activities/dokumentasi?activityId=${activityId}`)
      if (response.ok) {
        const data = await response.json()
        setDocumentation(data.dokumentasi || [])
      }
    } catch (error) {
      console.error("Error fetching documentation:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  const isImage = (fileType: string) => {
    return fileType.startsWith("image/")
  }

  const getFileIcon = (fileType: string) => {
    if (isImage(fileType)) {
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
      link.download = filename
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

  if (documentation.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Tidak ada dokumentasi untuk aktivitas ini</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dokumentasi Aktivitas</h3>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {documentation
          .filter((doc) => isImage(doc.file_type))
          .map((doc) => (
            <div key={doc.id} className="relative group">
              <div
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(doc.file_url)}
              >
                <img
                  src={doc.file_url || "/placeholder.svg"}
                  alt={doc.file_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
      </div>

      {/* File List */}
      <div className="space-y-3">
        {documentation.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-gray-500">{getFileIcon(doc.file_type)}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isImage(doc.file_type) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(doc.file_url)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(doc.file_url, doc.file_name)}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="w-4 h-4" />
              </Button>
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
