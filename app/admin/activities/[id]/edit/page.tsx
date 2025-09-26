"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import LiveSearchInput from "@/components/live-search-input"
import FileUpload from "@/components/file-upload"
import AlertModal from "@/components/alert-modal"
import DocumentationGallery from "@/components/documentation-gallery"
import { formatDisplayDate } from "@/lib/timezone"
import { FileIcon, X, RotateCcw } from "lucide-react"

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
  status?: string
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

interface Activity {
  id: number;
  tgl: string;
  tgl_pulang: string;
  id_ambulan: number;
  id_detail: number;
  jam_berangkat: string;
  jam_pulang: string;
  id_driver: number;
  asisten_luar_kota: string;
  area: string;
  dari: string;
  tujuan: string;
  km_awal: number;
  km_akhir: number;
  biaya_antar: number;
  biaya_dibayar: number;
  id_pemesan: number;
  id_penerima_manfaat: number;
  infaq: number;
  id_reward: number;
  kegiatan: string;
  rumpun_program: string;
  id_kantor?: number;
  documentation?: Array<{
    id: number;
    url: string;
    created_at: string;
  }>;
  nama_pemesan: string;
  hp: string;
  nama_pm: string;
  alamat_pm: string | null;
  jenis_kelamin_pm: string | null;
  usia_pm: number | null;
  nik: string | null;
  no_kk: string | null;
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  status_marital: string | null;
  agama: string | null;
  id_asnaf: number | null;
}

interface ActivityDetail extends Activity {
  tgl_berangkat: string
}

export default function AdminEditActivityPage({ params }: { params: { id: string } }) {
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
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  // Alert modal states
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertModalTitle, setAlertModalTitle] = useState("")
  const [alertModalMessage, setAlertModalMessage] = useState("")
  const [alertModalType, setAlertModalType] = useState<"info" | "success" | "warning" | "error">("info")

  // State for documentation files
  const [documentationFiles, setDocumentationFiles] = useState<File[]>([])
  const [existingDocumentation, setExistingDocumentation] = useState<Array<{id: number, url: string, created_at?: string}>>([])
  const [documentationToDelete, setDocumentationToDelete] = useState<number[]>([])
  
  // New state for tracking newly uploaded files that can be removed before saving
  const [newDocumentationFiles, setNewDocumentationFiles] = useState<File[]>([])
  
  // New state for soft deleted documentation (hidden with undo option)
  const [softDeletedDocumentation, setSoftDeletedDocumentation] = useState<number[]>([])
  
  // Keep a reference to all documentation for undo functionality
  const [allDocumentation, setAllDocumentation] = useState<Array<{id: number, url: string, created_at?: string}>>([])

  // Form state
  const [formData, setFormData] = useState({
    id_kantor: "1", // Default kantor for admin
    tgl_berangkat: "",
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
    biaya_antar: "0",
    biaya_dibayar: "",
    id_pemesan: "",
    id_penerima_manfaat: "",
    infaq: "",
    id_reward: "",
    kegiatan: "pengantaran",
    rumpun_program: "kesehatan",
  })

  // State to track if biaya_antar has been manually edited
  const [biayaAntarManuallyEdited, setBiayaAntarManuallyEdited] = useState(false);

  // New pemesan form state
  const [newPemesan, setNewPemesan] = useState({
    nama_pemesan: "",
    hp: ""
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
    agama: ""
  })

  // State untuk menyimpan data pemesan dan PM yang dipilih
  const [selectedPemesan, setSelectedPemesan] = useState<Pemesan | null>(null)
  const [selectedPM, setSelectedPM] = useState<PenerimaManfaat | null>(null)
  
  // State to store activity data temporarily until reference data is loaded
  const [activityData, setActivityData] = useState<ActivityDetail | null>(null)

  const activityId = parseInt(params.id)

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user && user.role !== "admin") {
      router.push("/unauthorized")
    }
  }, [user, loading, router])

  // Fetch all data in one go
  useEffect(() => {
    async function fetchData() {
      if (!user || isNaN(activityId)) return;

      try {
        setLoadingData(true);

        const [
          activityRes,
          kantorRes,
          ambulanRes,
          detailRes,
          driverRes,
          pemesanRes,
          pmRes,
          asnafRes,
          rewardRes
        ] = await Promise.all([
          fetch(`/api/admin/activities/${activityId}`),
          fetch("/api/reference/kantors"),
          fetch("/api/reference/ambulans"),
          fetch("/api/reference/details"),
          fetch("/api/reference/drivers"),
          fetch("/api/reference/pemesans"),
          fetch("/api/reference/penerima-manfaats"),
          fetch("/api/reference/asnafs"),
          fetch("/api/reference/rewards")
        ]);

        if (!activityRes.ok) throw new Error("Gagal memuat data aktivitas");
        
        const activity: ActivityDetail = await activityRes.json();
        setActivityData(activity);

        // Set reference data first
        if (kantorRes.ok) setKantors(await kantorRes.json());
        if (ambulanRes.ok) setAmbulans(await ambulanRes.json());
        if (detailRes.ok) setDetails(await detailRes.json());
        if (driverRes.ok) setDrivers(await driverRes.json());
        if (pemesanRes.ok) {
          const pemesansData = await pemesanRes.json();
          setPemesans(pemesansData);
        }
        if (pmRes.ok) {
          const pmsData = await pmRes.json();
          setPenerimaManfaats(pmsData);
        }
        if (asnafRes.ok) setAsnafs(await asnafRes.json());
        if (rewardRes.ok) setRewards(await rewardRes.json());

        // Now set form data with activity values after reference data is loaded
        setFormData({
            id_kantor: activity.id_kantor?.toString() || "1",
            tgl_berangkat: activity.tgl_berangkat || "",
            tgl_pulang: activity.tgl_pulang || "",
            id_ambulan: activity.id_ambulan?.toString() || "",
            id_detail: activity.id_detail?.toString() || "",
            jam_berangkat: activity.jam_berangkat || "",
            jam_pulang: activity.jam_pulang || "",
            id_driver: activity.id_driver?.toString() || "",
            asisten_luar_kota: activity.asisten_luar_kota || "",
            area: activity.area || "Dalam Kota",
            dari: activity.dari || "",
            tujuan: activity.tujuan || "",
            km_awal: activity.km_awal?.toString() || "",
            km_akhir: activity.km_akhir?.toString() || "",
            biaya_antar: activity.biaya_antar?.toString() || "0",
            biaya_dibayar: activity.biaya_dibayar !== null ? activity.biaya_dibayar.toString() : "",
            id_pemesan: activity.id_pemesan?.toString() || "",
            id_penerima_manfaat: activity.id_penerima_manfaat?.toString() || "",
            infaq: activity.infaq !== null ? activity.infaq.toString() : "",
            id_reward: activity.id_reward?.toString() || "",
            kegiatan: activity.kegiatan || "pengantaran",
            rumpun_program: activity.rumpun_program || "kesehatan",
        });

        // Reset biaya antar manual edit state when loading data
        setBiayaAntarManuallyEdited(false);

        // Set existing documentation
        if (activity.documentation) {
          const docs = activity.documentation.map((doc: any) => ({
            id: doc.id,
            url: doc.url,
            created_at: doc.created_at
          }));
          setExistingDocumentation(docs);
          setAllDocumentation(docs); // Keep a reference to all documentation
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, activityId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Track if biaya_antar is manually edited
    if (name === "biaya_antar") {
      setBiayaAntarManuallyEdited(true);
    }
    
    // Reset biaya antar manual edit state when km values change
    if (name === "km_awal" || name === "km_akhir") {
      setBiayaAntarManuallyEdited(false);
    }
    
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

  // Function to filter rewards based on driver status only
  const getFilteredRewards = () => {
    // If no driver selected, show all rewards
    if (!formData.id_driver) {
      return rewards;
    }
    
    // Find the selected driver
    const selectedDriver = drivers.find(driver => driver.id === parseInt(formData.id_driver));
    
    // If driver not found or no status, show all rewards
    if (!selectedDriver || !selectedDriver.status) {
      return rewards;
    }
    
    // Filter rewards based on driver status only
    return rewards.filter(reward => reward.jenis === selectedDriver.status);
  };

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      id_driver: value
    }))
  }

  const handleRewardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      id_reward: value
    }))
  }

  const handleCreatePemesan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reference/pemesans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newPemesan)
      })

      if (response.ok) {
        const createdPemesan = await response.json()
        // Add to pemesans list
        setPemesans(prev => [...prev, createdPemesan])
        // Set as selected
        setFormData(prev => ({
          ...prev,
          id_pemesan: createdPemesan.id.toString()
        }))
        // Close the create form
        setShowCreatePemesan(false)
        // Reset form
        setNewPemesan({
          nama_pemesan: "",
          hp: ""
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

  const handleDocumentationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setNewDocumentationFiles(prev => [...prev, ...files])
    }
  }
  
  const removeNewDocumentationFile = (index: number) => {
    setNewDocumentationFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const removeExistingDocumentation = (id: number) => {
    // Add to soft deletion list instead of immediate deletion
    setSoftDeletedDocumentation(prev => [...prev, id])
    
    // Remove from existing documentation display
    setExistingDocumentation(prev => prev.filter(doc => doc.id !== id))
  }
  
  // New function to undo soft deletion
  const undoDeleteDocumentation = (id: number) => {
    // Remove from soft deletion list
    setSoftDeletedDocumentation(prev => prev.filter(docId => docId !== id))
    
    // Find the document in allDocumentation and add it back to existingDocumentation
    const docToAddBack = allDocumentation.find(doc => doc.id === id);
    if (docToAddBack) {
      setExistingDocumentation(prev => [...prev, docToAddBack])
    }
  }
  
  const removeSelectedDocumentation = (ids: number[]) => {
    // Add all selected documents to soft deletion list
    setSoftDeletedDocumentation(prev => [...prev, ...ids])
    
    // Remove from existing documentation display
    setExistingDocumentation(prev => prev.filter(doc => !ids.includes(doc.id)))
  }

  const handlePemesanSelect = (pemesan: Pemesan | null) => {
    if (pemesan) {
      setFormData(prev => ({
        ...prev,
        id_pemesan: pemesan.id.toString()
      }))
      setSelectedPemesan(pemesan)
    } else {
      // Clear the selection
      setFormData(prev => ({
        ...prev,
        id_pemesan: ""
      }))
      setSelectedPemesan(null)
    }
  }

  const handlePMSelect = (pm: PenerimaManfaat | null) => {
    if (pm) {
      setFormData(prev => ({
        ...prev,
        id_penerima_manfaat: pm.id.toString()
      }))
      setSelectedPM(pm)
    } else {
      // Clear the selection
      setFormData(prev => ({
        ...prev,
        id_penerima_manfaat: ""
      }))
      setSelectedPM(null)
    }
  }
  
  // Update the useEffect that sets existingDocumentation to also set allDocumentation
  useEffect(() => {
    if (pemesans.length > 0 && penerimaManfaats.length > 0 && drivers.length > 0 && activityData && !selectedPemesan && !selectedPM) {
      // Get activity data from form state
      const activityIdPemesan = activityData.id_pemesan;
      const activityIdPM = activityData.id_penerima_manfaat;
      const activityIdDriver = activityData.id_driver;
      
      // Set selected pemesan if it exists
      if (activityIdPemesan && activityIdPemesan > 0) {
        const pemesan = pemesans.find(p => p.id === activityIdPemesan);
        if (pemesan && (!selectedPemesan || (selectedPemesan as Pemesan)?.id !== pemesan.id)) {
          setSelectedPemesan(pemesan);
        }
      }
      
      // Set selected PM if it exists
      if (activityIdPM && activityIdPM > 0) {
        const pm = penerimaManfaats.find(p => p.id === activityIdPM);
        if (pm && (!selectedPM || (selectedPM as PenerimaManfaat)?.id !== pm.id)) {
          setSelectedPM(pm);
        }
      }
      
      // Set selected driver if it exists
      if (activityIdDriver && activityIdDriver > 0) {
        const driver = drivers.find(d => d.id === activityIdDriver);
        if (driver) {
          setFormData(prev => ({
            ...prev,
            id_driver: activityIdDriver.toString()
          }));
        }
      }
      
      // Set existing documentation
      if (activityData.documentation) {
        const docs = activityData.documentation.map((doc: any) => ({
          id: doc.id,
          url: doc.url,
          created_at: doc.created_at
        }));
        setExistingDocumentation(docs);
        setAllDocumentation(docs); // Keep a reference to all documentation
      }
    }
  }, [pemesans.length, penerimaManfaats.length, drivers.length, activityData?.id]);

  // Additional useEffect to handle cases where reference data loads after activity data
  useEffect(() => {
    if (activityData && ((pemesans.length > 0 && penerimaManfaats.length > 0) || drivers.length > 0) && (!selectedPemesan || !selectedPM || !formData.id_driver)) {
      // Update pemesan if needed
      if (activityData.id_pemesan && activityData.id_pemesan > 0 && pemesans.length > 0 && !selectedPemesan) {
        const pemesan = pemesans.find(p => p.id === activityData.id_pemesan);
        if (pemesan && (!selectedPemesan || (selectedPemesan as Pemesan)?.id !== pemesan.id)) {
          setSelectedPemesan(pemesan);
        }
      }
      
      // Update PM if needed
      if (activityData.id_penerima_manfaat && activityData.id_penerima_manfaat > 0 && penerimaManfaats.length > 0 && !selectedPM) {
        const pm = penerimaManfaats.find(p => p.id === activityData.id_penerima_manfaat);
        if (pm && (!selectedPM || (selectedPM as PenerimaManfaat)?.id !== pm.id)) {
          setSelectedPM(pm);
        }
      }
      
      // Update driver if needed
      if (activityData.id_driver && activityData.id_driver > 0 && drivers.length > 0 && !formData.id_driver) {
        const driver = drivers.find(d => d.id === activityData.id_driver);
        if (driver) {
          setFormData(prev => ({
            ...prev,
            id_driver: activityData.id_driver.toString()
          }));
        }
      }
      
      // Set existing documentation if not already set
      if (activityData.documentation && existingDocumentation.length === 0) {
        const docs = activityData.documentation.map((doc: any) => ({
          id: doc.id,
          url: doc.url,
          created_at: doc.created_at
        }));
        setExistingDocumentation(docs);
        setAllDocumentation(docs); // Keep a reference to all documentation
      }
    }
  }, [pemesans.length, penerimaManfaats.length, drivers.length, activityData?.id, formData.id_driver]);

  // Update form data when drivers are loaded if we have activity data but no driver is selected in form
  useEffect(() => {
    if (activityData && drivers.length > 0 && !formData.id_driver && activityData.id_driver) {
      const driver = drivers.find(d => d.id === activityData.id_driver);
      if (driver) {
        setFormData(prev => ({
          ...prev,
          id_driver: activityData.id_driver.toString()
        }));
      }
    }
  }, [drivers.length, activityData?.id_driver, formData.id_driver]);
  
  // Automatically determine reward type based on driver status only
  useEffect(() => {
    // Only auto-select reward if we have a driver selected
    if (!formData.id_driver) return;
    
    // Find the selected driver
    const selectedDriver = drivers.find(driver => driver.id === parseInt(formData.id_driver));
    
    // If driver not found or no status, return
    if (!selectedDriver || !selectedDriver.status) return;
    
    // If there's already a selected reward that matches the driver's status, don't change it
    if (formData.id_reward) {
      const currentReward = rewards.find(r => r.id === parseInt(formData.id_reward));
      if (currentReward && currentReward.jenis === selectedDriver.status) {
        return; // Keep the current selection
      }
    }
    
    // Find the first reward that matches the driver's status
    const matchingReward = rewards.find(r => r.jenis === selectedDriver.status);
    
    if (matchingReward) {
      setFormData(prev => ({
        ...prev,
        id_reward: matchingReward.id.toString()
      }));
    }
  }, [formData.id_driver, rewards, drivers, formData.id_reward]);

  // Automatically calculate biaya_antar based on (km_akhir - km_awal) * 6000
  useEffect(() => {
    // Only auto-calculate if biaya_antar hasn't been manually edited
    if (!biayaAntarManuallyEdited) {
      const kmAwal = parseFloat(formData.km_awal as string) || 0;
      const kmAkhir = parseFloat(formData.km_akhir as string) || 0;
      
      if (kmAwal >= 0 && kmAkhir >= 0 && kmAkhir >= kmAwal) {
        const calculatedBiaya = (kmAkhir - kmAwal) * 6000;
        setFormData(prev => ({
          ...prev,
          biaya_antar: calculatedBiaya.toString()
        }));
      }
    }
  }, [formData.km_awal, formData.km_akhir, biayaAntarManuallyEdited]);

  const handleCreatePM = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/reference/penerima-manfaats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...newPM,
          // Convert numeric fields
          usia_pm: newPM.usia_pm ? parseInt(newPM.usia_pm) : null,
          id_asnaf: newPM.id_asnaf ? parseInt(newPM.id_asnaf) : null
        })
      })

      if (response.ok) {
        const createdPM = await response.json()
        // Add to penerima manfaats list
        setPenerimaManfaats(prev => [...prev, createdPM])
        // Set as selected
        setFormData(prev => ({
          ...prev,
          id_penerima_manfaat: createdPM.id.toString()
        }))
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
          agama: ""
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

  const handleDocumentationDelete = (id: number) => {
    setDocumentationToDelete(prev => [...prev, id]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const errors: Record<string, boolean> = {}
    
    // Always required fields
    if (!formData.tgl_berangkat) errors.tgl_berangkat = true
    if (!formData.tgl_pulang) errors.tgl_pulang = true
    if (!formData.id_ambulan) errors.id_ambulan = true
    if (!formData.id_detail) errors.id_detail = true
    if (!formData.jam_berangkat) errors.jam_berangkat = true
    if (!formData.jam_pulang) errors.jam_pulang = true
    if (!formData.dari) errors.dari = true
    if (!formData.tujuan) errors.tujuan = true
    // Removed validation for id_driver - not required for admin users
    
    // Removed validation for km_awal, km_akhir, biaya_antar, id_pemesan, and id_penerima_manfaat
    // These fields are now optional as requested
    
    // Update validation errors state
    setValidationErrors(errors)
    
    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      setError("Harap lengkapi semua field yang wajib diisi")
      return
    }
    
    try {
      setLoadingData(true)
      
      // Prepare form data
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value as string)
      })
      
      // Add documentation to delete (soft deleted documentation)
      if (softDeletedDocumentation.length > 0) {
        submitData.append('documentationToDelete', JSON.stringify(softDeletedDocumentation))
      }
      
      // Add new documentation files
      newDocumentationFiles.forEach((file) => {
        submitData.append('documentation', file)
      })
      
      const response = await fetch(`/api/admin/activities/${activityId}`, {
        method: "PUT",
        body: submitData
      })

      if (response.ok) {
        // Show alert modal instead of direct redirect
        setAlertModalTitle("Berhasil")
        setAlertModalMessage("Aktivitas berhasil diperbarui!")
        setAlertModalType("success")
        setAlertModalOpen(true)
      } else {
        const errorData = await response.json()
        // Create a more detailed error message
        let errorMessage = errorData.error || "Gagal memperbarui aktivitas"
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`
        }
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui aktivitas")
      console.error(err)
    } finally {
      setLoadingData(false)
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
            <h1 className="text-2xl font-bold text-gray-800">Edit Aktivitas</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-gray-900 font-semibold">Edit Aktivitas</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-900 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Kantor - Show for admin users */}
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
                {kantors.map(kantor => (
                  <option key={kantor.id} value={kantor.id}>
                    {kantor.kantor}
                  </option>
                ))}
              </select>
              {validationErrors.id_kantor && (
                <p className="mt-1 text-sm text-red-600">Kantor wajib dipilih</p>
              )}
            </div>
            
            {/* Tanggal Berangkat */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Berangkat</label>
              <input
                type="date"
                name="tgl_berangkat"
                value={formData.tgl_berangkat}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.tgl_berangkat ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.tgl_berangkat && (
                <p className="mt-1 text-sm text-red-600">Tanggal berangkat wajib diisi</p>
              )}
            </div>
            
            {/* Tanggal Pulang */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Pulang</label>
              <input
                type="date"
                name="tgl_pulang"
                value={formData.tgl_pulang}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.tgl_pulang ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.tgl_pulang && (
                <p className="mt-1 text-sm text-red-600">Tanggal pulang wajib diisi</p>
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
                {ambulans.map(ambulan => (
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
                {details.map(detail => (
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
            
            {/* Driver - Show for admin users */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Driver</label>
              <select
                name="id_driver"
                value={formData.id_driver}
                onChange={handleDriverChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.id_driver ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Pilih Driver (Opsional)</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} {driver.status && `(${driver.status})`}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Detail Driver (Read-only) - Always shown */}
            <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver Saat Ini</label>
                <input
                  type="text"
                  value={activityData?.id_driver && drivers.length > 0 
                    ? drivers.find(driver => driver.id === activityData.id_driver)?.name || "Tidak ada data"
                    : "Belum ada driver yang dipilih"
                  }
                  readOnly
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status Driver</label>
                <input
                  type="text"
                  value={activityData?.id_driver && drivers.length > 0 
                    ? drivers.find(driver => driver.id === activityData.id_driver)?.status || "Tidak ada data"
                    : "Belum ada driver yang dipilih"
                  }
                  readOnly
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Asisten Luar Kota */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Asisten Luar Kota</label>
              <input
                type="text"
                name="asisten_luar_kota"
                value={formData.asisten_luar_kota}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.asisten_luar_kota ? 'border-red-500' : 'border-gray-300'}`}
              />
              {/* Removed required validation for asisten_luar_kota - now optional */}
            </div>
            
            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Area</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.area ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="Dalam Kota">Dalam Kota</option>
                <option value="Luar Kota">Luar Kota</option>
              </select>
              {validationErrors.area && (
                <p className="mt-1 text-sm text-red-600">Area wajib dipilih</p>
              )}
            </div>
            
            {/* Dari */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Dari</label>
              <input
                type="text"
                name="dari"
                value={formData.dari}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.dari ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.dari && (
                <p className="mt-1 text-sm text-red-600">Dari wajib diisi</p>
              )}
            </div>
            
            {/* Tujuan */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tujuan</label>
              <input
                type="text"
                name="tujuan"
                value={formData.tujuan}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.tujuan ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.tujuan && (
                <p className="mt-1 text-sm text-red-600">Tujuan wajib diisi</p>
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
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.km_awal ? 'border-red-500' : 'border-gray-300'}`}
              />
              {/* Removed required validation for km_awal - now optional */}
            </div>
            
            {/* KM Akhir */}
            <div>
              <label className="block text-sm font-medium text-gray-700">KM Akhir</label>
              <input
                type="number"
                name="km_akhir"
                value={formData.km_akhir}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.km_akhir ? 'border-red-500' : 'border-gray-300'}`}
              />
              {/* Removed required validation for km_akhir - now optional */}
            </div>
            
            {/* Biaya Antar - Editable for all users */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Biaya Antar (Auto-calculated)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="biaya_antar"
                  value={formData.biaya_antar}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const kmAwal = parseFloat(formData.km_awal as string) || 0;
                    const kmAkhir = parseFloat(formData.km_akhir as string) || 0;
                    
                    if (kmAwal >= 0 && kmAkhir >= 0 && kmAkhir >= kmAwal) {
                      const calculatedBiaya = (kmAkhir - kmAwal) * 6000;
                      setFormData(prev => ({
                        ...prev,
                        biaya_antar: calculatedBiaya.toString()
                      }));
                      setBiayaAntarManuallyEdited(false);
                    }
                  }}
                  className="px-3 py-2 mt-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Reset
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Calculated as: (KM Akhir - KM Awal) × 6000</p>
            </div>
            
            {/* Jenis Pengantaran - Show filtered reward types based on driver status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Pengantaran</label>
              <select
                name="id_reward"
                value={formData.id_reward}
                onChange={handleRewardChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Pilih Jenis Pengantaran</option>
                {getFilteredRewards().map((reward) => (
                  <option key={reward.id} value={reward.id}>
                    {reward.jenis} - {reward.tipe}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Read-only display of current reward information */}
            {formData.id_reward && rewards.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Pengantaran Saat Ini</label>
                <input
                  type="text"
                  value={`${rewards.find(r => r.id === parseInt(formData.id_reward))?.jenis || ""} - ${rewards.find(r => r.id === parseInt(formData.id_reward))?.tipe || ""}`}
                  readOnly
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                />
              </div>
            )}
            
            {/* Reward - Read-only field showing the reward value */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Reward</label>
              <input
                type="text"
                value={
                  formData.id_reward 
                    ? rewards.find(r => r.id === parseInt(formData.id_reward))?.reward?.toLocaleString('id-ID') || ""
                    : ""
                }
                readOnly
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
              />
            </div>
            
            {/* Biaya Dibayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Biaya Dibayar</label>
              <input
                type="number"
                name="biaya_dibayar"
                value={formData.biaya_dibayar}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.biaya_dibayar ? 'border-red-500' : 'border-gray-300'}`}
              />
              {/* Removed required validation for biaya_dibayar - now optional */}
            </div>
            
            {/* Pemesan */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Pemesan</label>
              <LiveSearchInput
                items={pemesans}
                onSelect={handlePemesanSelect}
                onAutoFill={handlePemesanSelect}
                placeholder="Cari atau ketik nama pemesan/no HP"
                displayKey="nama_pemesan"
                searchKeys={["nama_pemesan", "hp"]}
                onCreate={() => setShowCreatePemesan(true)}
              />
            </div>

            {/* Detail Pemesan (Read-only) */}
            {selectedPemesan && (
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Detail Nama Pemesan</label>
                  <input
                    type="text"
                    value={selectedPemesan.nama_pemesan || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Detail No HP Pemesan</label>
                  <input
                    type="text"
                    value={selectedPemesan.hp || "Tidak ada data"}
                    readOnly
                    className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Penerima Manfaat */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Penerima Manfaat</label>
              <LiveSearchInput
                items={penerimaManfaats}
                onSelect={handlePMSelect}
                onAutoFill={handlePMSelect}
                placeholder="Cari atau ketik nama PM"
                displayKey="nama_pm"
                searchKeys={["nama_pm"]}
                onCreate={() => setShowCreatePM(true)}
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
                    value={
                      selectedPM?.jenis_kelamin_pm === 'l' ? 'Laki Laki' :
                      selectedPM?.jenis_kelamin_pm === 'p' ? 'Perempuan' :
                      selectedPM?.jenis_kelamin_pm || "Tidak ada data"
                    }
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
                    value={
                      selectedPM?.tgl_lahir 
                        ? formatDisplayDate(selectedPM.tgl_lahir)
                        : "Tidak ada data"
                    }
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
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.kegiatan ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.kegiatan && (
                <p className="mt-1 text-sm text-red-600">Kegiatan wajib diisi</p>
              )}
            </div>
            
            {/* Rumpun Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rumpun Program</label>
              <input
                type="text"
                name="rumpun_program"
                value={formData.rumpun_program}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.rumpun_program ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {validationErrors.rumpun_program && (
                <p className="mt-1 text-sm text-red-600">Rumpun program wajib diisi</p>
              )}
            </div>
            
            {/* Infaq */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Infaq</label>
              <input
                type="number"
                name="infaq"
                value={formData.infaq}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 mt-1 text-base border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${validationErrors.infaq ? 'border-red-500' : 'border-gray-300'}`}
              />
              {validationErrors.infaq && (
                <p className="mt-1 text-sm text-red-600">Infaq wajib diisi</p>
              )}
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Dokumentasi Aktivitas</label>
            <FileUpload
              onFilesChange={setNewDocumentationFiles}
              maxFiles={5}
              acceptedTypes={["image/*"]}
            />
            
            {/* Existing Documentation Gallery with Soft Delete Support */}
            <div className="mt-4">
              <DocumentationGallery 
                activityId={activityId}
                documentation={existingDocumentation.map(doc => ({
                  id: doc.id,
                  url: doc.url,
                  created_at: doc.created_at || new Date().toISOString()
                }))}
                onRemove={removeExistingDocumentation}
                editable={true}
                softDeletedDocumentation={softDeletedDocumentation}
                onUndoDelete={undoDeleteDocumentation}
                onDeleteSelected={removeSelectedDocumentation}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}>
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={loadingData}
            >
              {loadingData ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Create Pemesan Modal */}
      {showCreatePemesan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Tambah Pemesan Baru</h3>
            <form onSubmit={handleCreatePemesan}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
                <input
                  type="text"
                  value={newPemesan.nama_pemesan}
                  onChange={(e) => setNewPemesan({...newPemesan, nama_pemesan: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">No HP</label>
                <input
                  type="text"
                  value={newPemesan.hp}
                  onChange={(e) => setNewPemesan({...newPemesan, hp: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreatePemesan(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PM Modal */}
      {showCreatePM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Tambah Penerima Manfaat Baru</h3>
            <form onSubmit={handleCreatePM}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nama PM</label>
                <input
                  type="text"
                  value={newPM.nama_pm}
                  onChange={(e) => setNewPM({...newPM, nama_pm: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                  value={newPM.alamat_pm}
                  onChange={(e) => setNewPM({...newPM, alamat_pm: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  value={newPM.jenis_kelamin_pm}
                  onChange={(e) => setNewPM({...newPM, jenis_kelamin_pm: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="l">Laki-laki</option>
                  <option value="p">Perempuan</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Usia</label>
                <input
                  type="number"
                  value={newPM.usia_pm}
                  onChange={(e) => setNewPM({...newPM, usia_pm: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Asnaf</label>
                <select
                  value={newPM.id_asnaf}
                  onChange={(e) => setNewPM({...newPM, id_asnaf: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="">Pilih Asnaf</option>
                  {asnafs.map(asnaf => (
                    <option key={asnaf.id} value={asnaf.id}>{asnaf.asnaf}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">NIK</label>
                <input
                  type="text"
                  value={newPM.nik}
                  onChange={(e) => setNewPM({...newPM, nik: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">No KK</label>
                <input
                  type="text"
                  value={newPM.no_kk}
                  onChange={(e) => setNewPM({...newPM, no_kk: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                <input
                  type="text"
                  value={newPM.tempat_lahir}
                  onChange={(e) => setNewPM({...newPM, tempat_lahir: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  value={newPM.tgl_lahir}
                  onChange={(e) => setNewPM({...newPM, tgl_lahir: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status Marital</label>
                <input
                  type="text"
                  value={newPM.status_marital}
                  onChange={(e) => setNewPM({...newPM, status_marital: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Agama</label>
                <input
                  type="text"
                  value={newPM.agama}
                  onChange={(e) => setNewPM({...newPM, agama: e.target.value})}
                  className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreatePM(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false);
          // Redirect to admin page after successful update
          router.push("/admin");
        }}
        title={alertModalTitle}
        message={alertModalMessage}
        type={alertModalType}
      />
    </DashboardLayout>
  );
}
