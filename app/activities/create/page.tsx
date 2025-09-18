"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import LiveSearchInput from "@/components/live-search-input"
import FileUpload from "@/components/file-upload"

// Interface definitions
interface Kantor {
  id: number
  kantor: string
}

interface Ambulan {
  id: number
  nopol: string
}

interface DetailAntar {
  id: number
  detail_antar: string
}

interface Driver {
  id: number
  name: string
}

interface Pemesan {
  id: number
  nama_pemesan: string
  hp: string
}

interface PenerimaManfaat {
  id: number
  nama_pm: string
  alamat_pm: string | null
  jenis_kelamin_pm: string | null
  usia_pm: number | null
  id_asnaf: number | null
  nik: string | null
  no_kk: string | null
  tempat_lahir: string | null
  tgl_lahir: string | null
  status_marital: string | null
  agama: string | null
}

interface Asnaf {
  id: number
  asnaf: string
}

interface Reward {
  id: number
  jenis: string
  tipe: string
  reward: number | null
}

export default function CreateActivityPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [kantors, setKantors] = useState<Kantor[]>([])
  const [ambulans, setAmbulans] = useState<Ambulan[]>([])
  const [details, setDetails] = useState<DetailAntar[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [pemesans, setPemesans] = useState<Pemesan[]>([])
  const [penerimaManfaats, setPenerimaManfaats] = useState<PenerimaManfaat[]>([])
  const [asnafs, setAsnafs] = useState<Asnaf[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [showCreatePemesan, setShowCreatePemesan] = useState(false)
  const [showCreatePM, setShowCreatePM] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  // Check if user is a driver
  const isDriver = user?.role !== "admin"

  // Form state
  const [formData, setFormData] = useState({
    id_kantor: isDriver ? "1" : "", // Default kantor for drivers
    tgl: "",
    tgl_pulang: "",
    id_ambulan: "",
    id_detail: "",
    jam_berangkat: "",
    jam_pulang: "",
    id_driver: "",
    asisten_luar_kota: "",
    area: "Dalam Kota",
    dari: "",
    tujuan: "",
    km_awal: "",
    km_akhir: "",
    biaya_antar: "0", // This will be automatically calculated
    biaya_dibayar: "0", // Default value
    id_pemesan: "",
    id_penerima_manfaat: "",
    infaq: "0", // Default value
    id_reward: "",
    kegiatan: "pengantaran",
    rumpun_program: "kesehatan",
  })

  // New pemesan form state
  const [newPemesan, setNewPemesan] = useState({
    nama_pemesan: "",
    hp: "",
  })

  // New penerima manfaat form state
  const [newPM, setNewPM] = useState({
    nama_pm: "",
    alamat_pm: "",
    jenis_kelamin_pm: "",
    usia_pm: "",
    id_asnaf: "",
    nik: "",
    no_kk: "",
    tempat_lahir: "",
    tgl_lahir: "",
    status_marital: "",
    agama: "",
  })

  // State untuk menyimpan data pemesan dan PM yang dipilih
  const [selectedPemesan, setSelectedPemesan] = useState<Pemesan | null>(null)
  const [selectedPM, setSelectedPM] = useState<PenerimaManfaat | null>(null)

  const [documentationFiles, setDocumentationFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Debug modal states
  useEffect(() => {
    console.log("showCreatePemesan:", showCreatePemesan)
  }, [showCreatePemesan])

  useEffect(() => {
    console.log("showCreatePM:", showCreatePM)
  }, [showCreatePM])

  // Fetch reference data
  useEffect(() => {
    if (user) {
      fetchReferenceData()
      // Set the driver ID in the form when user is loaded
      if (user.role !== "admin") {
        setFormData(prev => ({
          ...prev,
          id_driver: user.id_driver?.toString() || user.id.toString()
        }))
      }
    }
  }, [user])

  const fetchReferenceData = async () => {
    try {
      setLoadingData(true)

      // Fetch all reference data in parallel
      const [kantorRes, ambulanRes, detailRes, driverRes, pemesanRes, pmRes, asnafRes, rewardRes] = await Promise.all([
        fetch("/api/reference/kantors"),
        fetch("/api/reference/ambulans"),
        fetch("/api/reference/details"),
        fetch("/api/reference/drivers"),
        fetch("/api/reference/pemesans"),
        fetch("/api/reference/penerima-manfaats"),
        fetch("/api/reference/asnafs"),
        fetch("/api/reference/rewards"),
      ])

      if (kantorRes.ok) setKantors(await kantorRes.json())
      if (ambulanRes.ok) setAmbulans(await ambulanRes.json())
      if (detailRes.ok) setDetails(await detailRes.json())
      if (driverRes.ok) setDrivers(await driverRes.json())
      if (pemesanRes.ok) setPemesans(await pemesanRes.json())
      if (pmRes.ok) setPenerimaManfaats(await pmRes.json())
      if (asnafRes.ok) setAsnafs(await asnafRes.json())
      if (rewardRes.ok) setRewards(await rewardRes.json())

      setLoadingData(false)
    } catch (err) {
      setError("Gagal memuat data referensi")
      setLoadingData(false)
      console.error(err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear general error message
    if (error) {
      setError(null)
    }
  }

  // Automatically calculate biaya_antar when km_awal or km_akhir changes
  useEffect(() => {
    const kmAwal = parseInt(formData.km_awal) || 0
    const kmAkhir = parseInt(formData.km_akhir) || 0
    
    // Only calculate if both values are valid and km_akhir >= km_awal
    if (kmAwal >= 0 && kmAkhir >= 0 && kmAkhir >= kmAwal) {
      const biaya = (kmAkhir - kmAwal) * 6000  // Changed from 3000 to 6000 Rupiah per kilometer
      // Only update if the calculated value is different to prevent infinite loop
      if (formData.biaya_antar !== biaya.toString()) {
        setFormData(prev => ({
          ...prev,
          biaya_antar: biaya.toString()
        }))
      }
    }
    // We intentionally exclude formData.biaya_antar from dependencies to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.km_awal, formData.km_akhir])

  const handlePemesanSelect = (pemesan: Pemesan) => {
    setFormData(prev => ({
      ...prev,
      id_pemesan: pemesan.id.toString()
    }))
    setSelectedPemesan(pemesan)
  }

  const handlePMSelect = (pm: PenerimaManfaat) => {
    setFormData(prev => ({
      ...prev,
      id_penerima_manfaat: pm.id.toString()
    }))
    setSelectedPM(pm)
  }

  const handleRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Temukan reward berdasarkan jenis dan tipe
    const reward = rewards.find((r) => `${r.jenis} - ${r.tipe}` === value)
    setFormData((prev) => ({
      ...prev,
      id_reward: reward ? reward.id.toString() : "",
    }))
  }

  const handleCreatePemesan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reference/pemesans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPemesan),
      })

      if (response.ok) {
        const createdPemesan = await response.json()
        // Add to pemesans list
        setPemesans((prev) => [...prev, createdPemesan])
        // Set as selected
        setFormData((prev) => ({
          ...prev,
          id_pemesan: createdPemesan.id.toString(),
        }))
        // Update search field
        handlePemesanSelect(createdPemesan)
        // Close the create form
        setShowCreatePemesan(false)
        // Reset form
        setNewPemesan({
          nama_pemesan: "",
          hp: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal membuat pemesan baru")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pemesan baru")
      console.error(err)
    }
  }

  const handleCreatePM = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reference/penerima-manfaats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPM,
          // Convert numeric fields
          usia_pm: newPM.usia_pm ? Number.parseInt(newPM.usia_pm) : null,
          id_asnaf: newPM.id_asnaf ? Number.parseInt(newPM.id_asnaf) : null,
        }),
      })

      if (response.ok) {
        const createdPM = await response.json()
        // Add to penerima manfaats list
        setPenerimaManfaats((prev) => [...prev, createdPM])
        // Set as selected
        setFormData((prev) => ({
          ...prev,
          id_penerima_manfaat: createdPM.id.toString(),
        }))
        // Update search field
        handlePMSelect(createdPM)
        // Close the create form
        setShowCreatePM(false)
        // Reset form
        setNewPM({
          nama_pm: "",
          alamat_pm: "",
          jenis_kelamin_pm: "",
          usia_pm: "",
          id_asnaf: "",
          nik: "",
          no_kk: "",
          tempat_lahir: "",
          tgl_lahir: "",
          status_marital: "",
          agama: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal membuat penerima manfaat baru")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat penerima manfaat baru")
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const errors: Record<string, boolean> = {}
    
    // Always required fields
    if (!formData.tgl) errors.tgl = true
    if (!formData.id_ambulan) errors.id_ambulan = true
    if (!formData.id_detail) errors.id_detail = true
    if (!formData.jam_berangkat) errors.jam_berangkat = true
    if (!formData.jam_pulang) errors.jam_pulang = true
    if (!formData.dari) errors.dari = true
    if (!formData.tujuan) errors.tujuan = true
    
    // Required for admin users
    if (user?.role === "admin" && !formData.id_driver) errors.id_driver = true
    
    // Required for non-admin users
    if (!isDriver && !formData.id_kantor) errors.id_kantor = true
    
    // Update validation errors state
    setValidationErrors(errors)
    
    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      setError("Harap lengkapi semua field yang wajib diisi")
      return
    }
    
    try {
      setLoadingData(true)
      
      // For non-admin users, use the id_driver from cms_users table
      // For admin users, use the selected driver from the form
      const driverId: string | null = user?.role === "admin" ? formData.id_driver : (user?.id_driver?.toString() || user?.id?.toString() || null)

      // Prepare data to send with proper type conversions
      const dataToSend = {
        ...formData,
        id_driver: driverId ? Number.parseInt(driverId) : null,
        // Convert numeric fields properly
        km_awal: formData.km_awal ? parseInt(formData.km_awal) : 0,
        km_akhir: formData.km_akhir ? parseInt(formData.km_akhir) : 0,
        biaya_antar: formData.biaya_antar ? parseInt(formData.biaya_antar) : 0,
        biaya_dibayar: formData.biaya_dibayar ? parseInt(formData.biaya_dibayar) : 0,
        infaq: formData.infaq ? parseInt(formData.infaq) : 0,
        id_reward: formData.id_reward ? parseInt(formData.id_reward) : null,
        id_kantor: formData.id_kantor ? parseInt(formData.id_kantor) : null,
        id_ambulan: formData.id_ambulan ? parseInt(formData.id_ambulan) : null,
        id_detail: formData.id_detail ? parseInt(formData.id_detail) : null,
        id_pemesan: formData.id_pemesan ? parseInt(formData.id_pemesan) : null,
        id_penerima_manfaat: formData.id_penerima_manfaat ? parseInt(formData.id_penerima_manfaat) : null
      }

      // Log the asisten_luar_kota value specifically
      console.log("Form asisten_luar_kota value:", formData.asisten_luar_kota);
      console.log("Type of asisten_luar_kota:", typeof formData.asisten_luar_kota);
      
      console.log("Sending data to API:", dataToSend);
      console.log("Raw form data:", formData);
      console.log("User role:", user?.role);
      console.log("Driver ID:", driverId);
      
      // Create FormData object to send both data and files
      const formDataObj = new FormData()
      formDataObj.append("data", JSON.stringify(dataToSend))
      
      // Add documentation files
      documentationFiles.forEach(file => {
        formDataObj.append("documentation", file)
      })
      
      const response = await fetch("/api/activities", {
        method: "POST",
        body: formDataObj
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)
        // Create a more detailed error message
        let errorMessage = errorData.error || "Gagal membuat aktivitas"
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
        if (errorData.code) {
          errorMessage += ` (Code: ${errorData.code})`
        }
        if (errorData.detail) {
          errorMessage += ` - Detail: ${errorData.detail}`
        }
        if (errorData.hint) {
          errorMessage += ` - Hint: ${errorData.hint}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // Check if the result contains the expected id
      if (!result || !result.id) {
        throw new Error("Invalid response from server: " + JSON.stringify(result))
      }
      
      const activityId = result.id

      if (documentationFiles.length > 0) {
        setUploadingFiles(true)

        // Upload files to blob storage
        const formData = new FormData()
        documentationFiles.forEach((file) => {
          formData.append("files", file)
        })

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          
          // Check if uploadResult has the expected files property
          if (uploadResult && uploadResult.files) {
            // Save documentation records to database
            await fetch("/api/activities/dokumentasi", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                activityId: activityId,
                files: uploadResult.files,
              }),
            })
          } else {
            console.warn("Upload result does not contain expected files property:", uploadResult)
          }
        }

        setUploadingFiles(false)
      }

      alert("Aktivitas berhasil dibuat!")

      if (user?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat aktivitas")
      console.error("Form Submission Error:", err)
    } finally {
      setLoadingData(false)
      setUploadingFiles(false)
    }
  }

  if (loading || loadingData) {
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Tambah Aktivitas</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-gray-900 font-semibold">Tambah Aktivitas</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-900 hover:text-red-700 font-bold">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Kantor - Only show for admin users */}
            {!isDriver && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kantor</label>
                <select
                  name="id_kantor"
                  value={formData.id_kantor}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.id_kantor ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Pilih Kantor</option>
                  {kantors.map((kantor) => (
                    <option key={kantor.id} value={kantor.id}>
                      {kantor.kantor}
                    </option>
                  ))}
                </select>
                {validationErrors.id_kantor && (
                  <p className="mt-1 text-sm text-red-600">Kantor wajib dipilih</p>
                )}
              </div>
            )}

            {/* Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal</label>
              <input
                type="date"
                name="tgl"
                value={formData.tgl}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.tgl ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.tgl && (
                <p className="mt-1 text-sm text-red-600">Tanggal wajib diisi</p>
              )}
            </div>

            {/* Ambulan */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ambulan</label>
              <select
                name="id_ambulan"
                value={formData.id_ambulan}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.id_ambulan ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Pilih Ambulan</option>
                {ambulans.map((ambulan) => (
                  <option key={ambulan.id} value={ambulan.id}>
                    {ambulan.nopol}
                  </option>
                ))}
              </select>
              {validationErrors.id_ambulan && (
                <p className="mt-1 text-sm text-red-600">Ambulan wajib dipilih</p>
              )}
            </div>

            {/* Detail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Detail</label>
              <select
                name="id_detail"
                value={formData.id_detail}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.id_detail ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Pilih Detail</option>
                {details.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.detail_antar}
                  </option>
                ))}
              </select>
              {validationErrors.id_detail && (
                <p className="mt-1 text-sm text-red-600">Detail wajib dipilih</p>
              )}
            </div>

            {/* Jam Berangkat */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jam Berangkat</label>
              <input
                type="time"
                name="jam_berangkat"
                value={formData.jam_berangkat}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.jam_berangkat ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.jam_berangkat && (
                <p className="mt-1 text-sm text-red-600">Jam berangkat wajib diisi</p>
              )}
            </div>

            {/* Jam Pulang */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jam Pulang</label>
              <input
                type="time"
                name="jam_pulang"
                value={formData.jam_pulang}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.jam_pulang ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.jam_pulang && (
                <p className="mt-1 text-sm text-red-600">Jam pulang wajib diisi</p>
              )}
            </div>

            {/* Driver (only for admin) */}
            {user?.role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver</label>
                <select
                  name="id_driver"
                  value={formData.id_driver}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.id_driver ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Pilih Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {validationErrors.id_driver && (
                  <p className="mt-1 text-sm text-red-600">Driver wajib dipilih</p>
                )}
              </div>
            )}
            {user?.role !== "admin" && user && <input type="hidden" name="id_driver" value={user.id} />}

            {/* Jenis (Reward) - Diubah menjadi textbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis</label>
              <input
                type="text"
                name="jenis"
                value={
                  rewards.find((r) => r.id === Number.parseInt(formData.id_reward || "0"))
                    ? `${rewards.find((r) => r.id === Number.parseInt(formData.id_reward || "0"))?.jenis} - ${rewards.find((r) => r.id === Number.parseInt(formData.id_reward || "0"))?.tipe}`
                    : ""
                }
                onChange={handleRewardChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                list="reward-options"
                placeholder="Pilih atau ketik jenis reward"
              />
              <datalist id="reward-options">
                {rewards.map((reward) => (
                  <option key={reward.id} value={`${reward.jenis} - ${reward.tipe}`} />
                ))}
              </datalist>
            </div>

            {/* Reward (dalam Rupiah) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Reward (Rp)</label>
              <input
                type="text"
                name="reward_value"
                value={
                  rewards.find((r) => r.id === Number.parseInt(formData.id_reward || "0"))?.reward
                    ? `Rp ${rewards.find((r) => r.id === Number.parseInt(formData.id_reward || "0"))?.reward?.toLocaleString("id-ID")}`
                    : ""
                }
                readOnly
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                placeholder="Pilih jenis reward terlebih dahulu"
              />
            </div>

            {/* Asisten Luar Kota */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Asisten Luar Kota</label>
              <input
                type="text"
                name="asisten_luar_kota"
                value={formData.asisten_luar_kota}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Dari */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dari</label>
              <textarea
                name="dari"
                value={formData.dari}
                onChange={handleInputChange}
                rows={2}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.dari ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validationErrors.dari && (
                <p className="mt-1 text-sm text-red-600">Field 'Dari' wajib diisi</p>
              )}
            </div>

            {/* Tujuan */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tujuan</label>
              <textarea
                name="tujuan"
                value={formData.tujuan}
                onChange={handleInputChange}
                rows={2}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.tujuan ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validationErrors.tujuan && (
                <p className="mt-1 text-sm text-red-600">Field 'Tujuan' wajib diisi</p>
              )}
            </div>

            {/* KM Awal */}
            <div>
              <label className="block text-sm font-medium text-gray-700">KM Awal</label>
              <input
                type="number"
                name="km_awal"
                value={formData.km_awal}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* KM Akhir */}
            <div>
              <label className="block text-sm font-medium text-gray-700">KM Akhir</label>
              <input
                type="number"
                name="km_akhir"
                value={formData.km_akhir}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            {/* Biaya Antar - Read-only for drivers, auto-calculated */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Biaya Antar</label>
              {isDriver ? (
                <input
                  type="number"
                  name="biaya_antar"
                  value={formData.biaya_antar}
                  readOnly
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                />
              ) : (
                <input
                  type="number"
                  name="biaya_antar"
                  value={formData.biaya_antar}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              )}
            </div>

            {/* Biaya yang Dibayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Biaya yang Dibayar</label>
              <input
                type="number"
                name="biaya_dibayar"
                value={formData.biaya_dibayar}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            {/* Nama Pemesan - Live Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
              <LiveSearchInput
                items={pemesans}
                onSelect={handlePemesanSelect}
                placeholder="Cari atau ketik nama pemesan"
                displayKey="nama_pemesan"
                searchKeys={["nama_pemesan", "hp"]}
              />
            </div>

            {/* Detail Pemesan (Read-only) */}
            {selectedPemesan && (
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
                  <input
                    type="text"
                    value={selectedPemesan.nama_pemesan || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">No HP</label>
                  <input
                    type="text"
                    value={selectedPemesan.hp || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Nama PM - Live Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama PM</label>
              <LiveSearchInput
                items={penerimaManfaats}
                onSelect={handlePMSelect}
                placeholder="Cari atau ketik nama PM"
                displayKey="nama_pm"
                searchKeys={["nama_pm"]}
              />
            </div>

            {/* Detail PM (Read-only) */}
            {selectedPM && (
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama PM</label>
                  <input
                    type="text"
                    value={selectedPM.nama_pm || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alamat PM</label>
                  <input
                    type="text"
                    value={selectedPM.alamat_pm || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                  <input
                    type="text"
                    value={selectedPM.jenis_kelamin_pm || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usia</label>
                  <input
                    type="text"
                    value={
                      selectedPM.usia_pm !== undefined && selectedPM.usia_pm !== null
                        ? selectedPM.usia_pm.toString()
                        : "Tidak ada data"
                    }
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIK</label>
                  <input
                    type="text"
                    value={selectedPM.nik || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">No KK</label>
                  <input
                    type="text"
                    value={selectedPM.no_kk || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                  <input
                    type="text"
                    value={selectedPM.tempat_lahir || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={selectedPM.tgl_lahir || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Marital</label>
                  <input
                    type="text"
                    value={selectedPM.status_marital || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agama</label>
                  <input
                    type="text"
                    value={selectedPM.agama || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Kegiatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Kegiatan</label>
              <input
                type="text"
                name="kegiatan"
                value={formData.kegiatan}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Rumpun Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rumpun Program</label>
              <input
                type="text"
                name="rumpun_program"
                value={formData.rumpun_program}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Infaq */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Infaq</label>
              <input
                type="number"
                name="infaq"
                value={formData.infaq}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dokumentasi Aktivitas</label>
              <FileUpload
                onFilesChange={setDocumentationFiles}
                maxFiles={5}
                acceptedTypes={["image/*", ".pdf", ".doc", ".docx"]}
              />
            </div>
          </div>
          
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (user?.role === "admin") {
                  router.push("/admin")
                } else {
                  router.push("/dashboard")
                }
              }}
            >
              Batal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loadingData || uploadingFiles}>
              {loadingData ? "Menyimpan..." : uploadingFiles ? "Mengupload..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Create Pemesan Modal */}
      {showCreatePemesan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md border-4 border-red-500">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tambah Pemesan Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowCreatePemesan(false)}
                  className="text-gray-400 hover:text-gray-500 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreatePemesan}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
                    <input
                      type="text"
                      value={newPemesan.nama_pemesan}
                      onChange={(e) => setNewPemesan({ ...newPemesan, nama_pemesan: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">No HP</label>
                    <input
                      type="text"
                      value={newPemesan.hp}
                      onChange={(e) => setNewPemesan({ ...newPemesan, hp: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreatePemesan(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create PM Modal */}
      {showCreatePM && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border-4 border-blue-500">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tambah PM Baru</h3>
                <button
                  type="button"
                  onClick={() => setShowCreatePM(false)}
                  className="text-gray-400 hover:text-gray-500 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreatePM}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama PM</label>
                    <input
                      type="text"
                      value={newPM.nama_pm}
                      onChange={(e) => setNewPM({ ...newPM, nama_pm: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                    <textarea
                      value={newPM.alamat_pm}
                      onChange={(e) => setNewPM({ ...newPM, alamat_pm: e.target.value })}
                      rows={3}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                    <select
                      value={newPM.jenis_kelamin_pm}
                      onChange={(e) => setNewPM({ ...newPM, jenis_kelamin_pm: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usia</label>
                    <input
                      type="number"
                      value={newPM.usia_pm}
                      onChange={(e) => setNewPM({ ...newPM, usia_pm: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Asnaf</label>
                    <select
                      value={newPM.id_asnaf}
                      onChange={(e) => setNewPM({ ...newPM, id_asnaf: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Pilih Asnaf</option>
                      {asnafs.map((asnaf) => (
                        <option key={asnaf.id} value={asnaf.id}>
                          {asnaf.asnaf}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NIK</label>
                    <input
                      type="text"
                      value={newPM.nik}
                      onChange={(e) => setNewPM({ ...newPM, nik: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">No KK</label>
                    <input
                      type="text"
                      value={newPM.no_kk}
                      onChange={(e) => setNewPM({ ...newPM, no_kk: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                    <input
                      type="text"
                      value={newPM.tempat_lahir}
                      onChange={(e) => setNewPM({ ...newPM, tempat_lahir: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newPM.tgl_lahir}
                      onChange={(e) => setNewPM({ ...newPM, tgl_lahir: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Marital</label>
                    <select
                      value={newPM.status_marital}
                      onChange={(e) => setNewPM({ ...newPM, status_marital: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Pilih Status</option>
                      <option value="Menikah">Menikah</option>
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Cerai">Cerai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agama</label>
                    <input
                      type="text"
                      value={newPM.agama}
                      onChange={(e) => setNewPM({ ...newPM, agama: e.target.value })}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreatePM(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
