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

export default function EditActivityPage({ params }: { params: { id: string } }) {
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
  const [loadingData, setLoadingData] = useState(true) // Set true di awal
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  // Alert modal states - Added to match create page
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertModalTitle, setAlertModalTitle] = useState("")
  const [alertModalMessage, setAlertModalMessage] = useState("")
  const [alertModalType, setAlertModalType] = useState<"info" | "success" | "warning" | "error">("info")

  // State for documentation files
  const [documentationFiles, setDocumentationFiles] = useState<File[]>([])
  const [existingDocumentation, setExistingDocumentation] = useState<Array<{id: number, url: string, created_at?: string}>>([])
  const [documentationToDelete, setDocumentationToDelete] = useState<number[]>([])

  // Check if user is a driver
  const isDriver = user?.role !== "admin";

  // Form state
  const [formData, setFormData] = useState({
    id_kantor: isDriver ? "1" : "", // Default kantor for drivers
    tgl_berangkat: "", // Changed from tgl to tgl_berangkat
    tgl_pulang: "",
    id_ambulan: "",
    id_detail: "",
    jam_berangkat: "",
    jam_pulang: "",
    id_driver: user?.role === "admin" ? "" : user?.id.toString() || "",
    asisten_luar_kota: "",
    area: "Dalam Kota",
    dari: "",
    tujuan: "",
    km_awal: "",
    km_akhir: "",
    biaya_antar: "0", // This will be automatically calculated
    biaya_dibayar: "", // Allow empty value
    id_pemesan: "",
    id_penerima_manfaat: "",
    infaq: "", // Allow empty value
    id_reward: "",
    kegiatan: "pengantaran",
    rumpun_program: "kesehatan",
  })

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
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
          fetch(`/api/activities/${activityId}`),
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

        // Set form data with activity values
        setFormData({
            id_kantor: activity.id_kantor?.toString() || (isDriver ? "1" : ""),
            tgl_berangkat: activity.tgl_berangkat || "", // Changed from tgl
            tgl_pulang: activity.tgl_pulang || "",
            id_ambulan: activity.id_ambulan?.toString() || "",
            id_detail: activity.id_detail?.toString() || "",
            jam_berangkat: activity.jam_berangkat || "",
            jam_pulang: activity.jam_pulang || "",
            id_driver: activity.id_driver?.toString() || (user?.role === "admin" ? "" : user?.id.toString() || ""),
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

        // Set existing documentation
        if (activity.documentation) {
          setExistingDocumentation(activity.documentation.map((doc: any) => ({
            id: doc.id,
            url: doc.url,
            created_at: doc.created_at
          })));
        }

        // Set reference data
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

      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [user, activityId, isDriver]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  // Function to filter rewards based on time range
  const getFilteredRewards = () => {
    // If we don't have both jam berangkat and jam pulang, show all rewards
    if (!formData.jam_berangkat || !formData.jam_pulang) {
      return rewards;
    }

    const startHour = parseInt(formData.jam_berangkat.split(":")[0]);
    const endHour = parseInt(formData.jam_pulang.split(":")[0]);
    
    // Determine which time range the selected hours fall into
    let validRewardTypes = new Set<string>();
    
    // Special case: Luar Kota
    if (formData.area === "Luar Kota") {
      validRewardTypes.add("luar kota");
    } else {
      // Saturday special case (14:50-23:00)
      if (startHour === 14 && endHour === 23) {
        validRewardTypes.add("Sabtu 14.50 sd 23.00");
      }
      // Regular time ranges
      else if ((startHour >= 8 && startHour < 16) && (endHour >= 8 && endHour < 16)) {
        validRewardTypes.add("Jam Pengantaran 08.00 - 16.00");
      } else if ((startHour >= 16 && startHour < 22) && (endHour >= 16 && endHour < 22)) {
        validRewardTypes.add("Jam Pengantaran 16.00 - 22.00");
      } else if ((startHour >= 22 || startHour < 3) && (endHour >= 22 || endHour < 3)) {
        validRewardTypes.add("Jam Pengantaran 22.00 - 03.00");
      } else if ((startHour >= 3 && startHour < 8) && (endHour >= 3 && endHour < 8)) {
        validRewardTypes.add("Jam Pengantaran 04.00 - 07.30");
      } else {
        // Default to Libur for irregular hours
        validRewardTypes.add("Libur");
      }
      
      // Always include special types
      validRewardTypes.add("luar kota");
      validRewardTypes.add("lain-lain");
    }
    
    // Filter rewards based on jenis and valid reward types
    const driverJenis = user?.role !== "admin" ? "karyawan" : null;
    
    return rewards.filter(reward => {
      // For admin users, show all rewards
      // For driver users, filter by driver status (karyawan/freelance)
      const showReward = (user?.role === "admin") || 
                        (user?.role === "driver" && reward.jenis === "karyawan");
      
      // If we should show this reward based on user role, check time range
      if (showReward) {
        // Always show special types regardless of time
        if (reward.tipe === "luar kota" || reward.tipe === "lain-lain" || reward.tipe === "Libur") {
          return true;
        }
        // Show only rewards that match the valid time range
        return validRewardTypes.has(reward.tipe);
      }
      
      return false;
    });
  };

  // Automatically determine reward type based on driver status and time schedule
  useEffect(() => {
    // Only auto-select reward if we have all required data
    if (!formData.jam_berangkat || !formData.jam_pulang) return;
    
    // Determine if driver is employee or freelance
    // For drivers, check their status
    // For admin, show all options
    let driverJenis = "karyawan"; // Default to karyawan
    
    // If user is admin, we'll let them choose
    // If user is driver, determine their status
    if (user?.role !== "admin") {
      // For now, we'll default to karyawan for all drivers
      // In a more complete implementation, we would check the actual driver status
      driverJenis = "karyawan";
    }
    
    // Determine time-based reward type
    let rewardType = "";
    const startHour = parseInt(formData.jam_berangkat.split(":")[0]);
    const endHour = parseInt(formData.jam_pulang.split(":")[0]);
    
    // Check for special cases first
    if (formData.area === "Luar Kota") {
      rewardType = "luar kota";
    } else {
      // Regular time-based rewards
      if (startHour === 14 && endHour === 23) {
        rewardType = "Sabtu 14.50 sd 23.00";
      } else if ((startHour >= 8 && startHour < 16) && (endHour >= 8 && endHour < 16)) {
        rewardType = "Jam Pengantaran 08.00 - 16.00";
      } else if ((startHour >= 16 && startHour < 22) && (endHour >= 16 && endHour < 22)) {
        rewardType = "Jam Pengantaran 16.00 - 22.00";
      } else if ((startHour >= 22 || startHour < 3) && (endHour >= 22 || endHour < 3)) {
        rewardType = "Jam Pengantaran 22.00 - 03.00";
      } else if ((startHour >= 3 && startHour < 8) && (endHour >= 3 && endHour < 8)) {
        rewardType = "Jam Pengantaran 04.00 - 07.30";
      } else {
        // Default to Libur for irregular hours
        rewardType = "Libur";
      }
    }
    
    // Find matching reward
    const matchingReward = rewards.find(
      r => r.jenis === driverJenis && r.tipe === rewardType
    );
    
    if (matchingReward) {
      setFormData(prev => ({
        ...prev,
        id_reward: matchingReward.id.toString()
      }));
    }
  }, [formData.jam_berangkat, formData.jam_pulang, formData.area, rewards, user?.role]);

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

  const handleDocumentationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setDocumentationFiles(prev => [...prev, ...files])
    }
  }
  
  const removeDocumentationFile = (index: number) => {
    setDocumentationFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const removeExistingDocumentation = (id: number) => {
    // Add to deletion list
    setDocumentationToDelete(prev => [...prev, id])
    
    // Remove from existing documentation display
    setExistingDocumentation(prev => prev.filter(doc => doc.id !== id))
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
  
  // Set selected pemesan and PM after both activity data and reference data are loaded
  useEffect(() => {
    // Only try to set selected pemesan and PM after both activity data and reference data are loaded
    if (pemesans.length > 0 && penerimaManfaats.length > 0 && activityData && !selectedPemesan && !selectedPM) {
      // Get activity data from form state
      const activityIdPemesan = activityData.id_pemesan;
      const activityIdPM = activityData.id_penerima_manfaat;
      
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
    }
  }, [pemesans.length, penerimaManfaats.length, activityData?.id, selectedPemesan?.id, selectedPM?.id])

  // Additional useEffect to handle cases where reference data loads after activity data
  useEffect(() => {
    if (activityData && (pemesans.length > 0 || penerimaManfaats.length > 0) && (!selectedPemesan || !selectedPM)) {
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
    }
  }, [pemesans.length, penerimaManfaats.length, activityData?.id, selectedPemesan?.id, selectedPM?.id])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const errors: Record<string, boolean> = {}
    
    // Always required fields
    if (!formData.tgl_berangkat) errors.tgl_berangkat = true // Changed from tgl
    if (!formData.tgl_pulang) errors.tgl_pulang = true
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
    
    // Note: We're intentionally NOT validating that existing pemesan/PM data must be preserved
    // This allows users to clear and change these fields if the existing data is incorrect
    
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
      
      // Add documentation to delete
      if (documentationToDelete.length > 0) {
        submitData.append('documentationToDelete', JSON.stringify(documentationToDelete))
      }
      
      // Add new documentation files
      documentationFiles.forEach((file) => {
        submitData.append('documentation', file)
      })
      
      const response = await fetch(`/api/activities/${activityId}`, {
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
      console.error("Form Submission Error:", err)
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
            )}
            
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
            
            {/* Driver - Only show for admin users */}
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
                  {drivers.map(driver => (
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
              {validationErrors.asisten_luar_kota && (
                <p className="mt-1 text-sm text-red-600">Asisten luar kota wajib diisi</p>
              )}
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
                required
              />
              {validationErrors.km_awal && (
                <p className="mt-1 text-sm text-red-600">KM awal wajib diisi</p>
              )}
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
                required
              />
              {validationErrors.km_akhir && (
                <p className="mt-1 text-sm text-red-600">KM akhir wajib diisi</p>
              )}
            </div>
            
            {/* Biaya Antar - Editable for all users */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Biaya Antar</label>
              <input
                type="number"
                name="biaya_antar"
                value={formData.biaya_antar}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            {/* Jenis Pengantaran - Moved to correct position */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Pengantaran</label>
              <select
                name="id_reward"
                value={formData.id_reward}
                onChange={handleRewardChange}
                className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Pilih Jenis Pengantaran</option>
                {getFilteredRewards().map((reward) => {
                  // For admin users, show all rewards
                  // For driver users, filter by driver status (karyawan/freelance)
                  const showReward = (user?.role === "admin") || 
                                   (user?.role === "driver" && reward.jenis === "karyawan");
                  return showReward && (
                    <option key={reward.id} value={reward.id}>
                      {reward.jenis} - {reward.tipe}
                    </option>
                  );
                })}
              </select>
            </div>
            
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
              {validationErrors.biaya_dibayar && (
                <p className="mt-1 text-sm text-red-600">Biaya dibayar wajib diisi</p>
              )}
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
                        ? new Date(selectedPM.tgl_lahir).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
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
              onFilesChange={setDocumentationFiles}
              maxFiles={5}
              acceptedTypes={["image/*"]}
            />
            
            {/* Existing Documentation Gallery */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dokumentasi yang Sudah Ada:</h4>
              <DocumentationGallery 
                activityId={activityId}
                documentation={existingDocumentation.map(doc => ({
                  id: doc.id,
                  url: doc.url,
                  created_at: doc.created_at || new Date().toISOString() // Use actual created_at if available
                }))}
                onRemove={removeExistingDocumentation}
                editable={true}
              />
              {documentationToDelete.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {documentationToDelete.length} file akan dihapus saat menyimpan perubahan
                </div>
              )}
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
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loadingData}
            >
              {loadingData ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>

      {/* Create Pemesan Modal */}
      {showCreatePemesan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
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
                      onChange={(e) => setNewPemesan({...newPemesan, nama_pemesan: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">No HP</label>
                    <input
                      type="text"
                      value={newPemesan.hp}
                      onChange={(e) => setNewPemesan({...newPemesan, hp: e.target.value})}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ zIndex: 9999 }}>
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
                      onChange={(e) => setNewPM({...newPM, nama_pm: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Alamat</label>
                    <textarea
                      value={newPM.alamat_pm}
                      onChange={(e) => setNewPM({...newPM, alamat_pm: e.target.value})}
                      rows={3}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                    <select
                      value={newPM.jenis_kelamin_pm}
                      onChange={(e) => setNewPM({...newPM, jenis_kelamin_pm: e.target.value})}
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
                      onChange={(e) => setNewPM({...newPM, usia_pm: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Asnaf</label>
                    <select
                      value={newPM.id_asnaf}
                      onChange={(e) => setNewPM({...newPM, id_asnaf: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                      <option value="">Pilih Asnaf</option>
                      {asnafs.map(asnaf => (
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
                      onChange={(e) => setNewPM({...newPM, nik: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">No KK</label>
                    <input
                      type="text"
                      value={newPM.no_kk}
                      onChange={(e) => setNewPM({...newPM, no_kk: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                    <input
                      type="text"
                      value={newPM.tempat_lahir}
                      onChange={(e) => setNewPM({...newPM, tempat_lahir: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newPM.tgl_lahir}
                      onChange={(e) => setNewPM({...newPM, tgl_lahir: e.target.value})}
                      className="block w-full px-3 py-2 mt-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status Marital</label>
                    <select
                      value={newPM.status_marital}
                      onChange={(e) => setNewPM({...newPM, status_marital: e.target.value})}
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
                      onChange={(e) => setNewPM({...newPM, agama: e.target.value})}
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

      {/* Alert Modal - Added to match create page */}
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => {
          setAlertModalOpen(false)
          // Redirect after closing the modal if it was a success
          if (alertModalType === "success") {
            router.push('/dashboard')
          }
        }}
        title={alertModalTitle}
        message={alertModalMessage}
        type={alertModalType}
      />
    </DashboardLayout>
  )
}