import { notFound, redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getActivityById } from "@/lib/activities"
import { sql } from "@/lib/db"
import DashboardLayout from "@/components/dashboard-layout"
import DocumentationGallery from "@/components/documentation-gallery"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import DocumentationImage from "@/components/documentation-image"

interface User {
  id: number
  name: string
  email: string
  role: "driver" | "admin"
  status: string
  photo?: string
  id_driver?: number
}

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
  // Additional fields for detail view
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
  // Documentation files
  documentation?: Array<{
    id: number
    url: string
    created_at: string
  }>
}

// Function to get current user from session
async function getCurrentUser(): Promise<User | null> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    // Import the getSession function to ensure consistency
    const { getSession } = await import("@/app/api/auth/session/route")

    const session = await getSession(sessionToken)

    if (!session) {
      return null
    }

    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get activity by ID with documentation
async function getActivityByIdWithDocumentation(id: number): Promise<Activity | null> {
  try {
    // Get the base activity data
    const activityResult = await sql`
      SELECT 
        a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
        a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
        a.km_awal, a.km_akhir, 
        COALESCE(p.nama_pemesan, a.nama_pemesan) as nama_pemesan, 
        COALESCE(p.hp, a.hp) as hp, 
        COALESCE(pm.nama_pm, a.nama_pm) as nama_pm, 
        a.area, a.asisten_luar_kota,
        COALESCE(pm.alamat_pm, a.alamat_pm) as alamat_pm, 
        COALESCE(pm.jenis_kelamin_pm, a.jenis_kelamin_pm) as jenis_kelamin_pm, 
        COALESCE(pm.usia_pm, 
          CASE 
            WHEN a.usia_pm::TEXT ~ '^[0-9]+$' THEN a.usia_pm::INTEGER
            ELSE NULL
          END) as usia_pm, 
        COALESCE(pm.nik, a.nik) as nik, 
        COALESCE(pm.no_kk, a.no_kk) as no_kk, 
        COALESCE(pm.tempat_lahir, a.tempat_lahir) as tempat_lahir, 
        COALESCE(pm.tgl_lahir, 
          CASE 
            WHEN a.tgl_lahir::TEXT ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN a.tgl_lahir::DATE
            ELSE NULL
          END) as tgl_lahir,
        COALESCE(pm.status_marital, a.status_marital) as status_marital, 
        a.kegiatan, a.rumpun_program, a.diagnosa_sakit, 
        COALESCE(pm.agama, a.agama) as agama, 
        a.infaq, a.biaya_dibayar, 
        COALESCE(pm.id_asnaf, 
          CASE 
            WHEN a.id_asnaf > 0 THEN a.id_asnaf
            ELSE NULL
          END) as id_asnaf,
        amb.id as ambulance_id, amb.nopol, '' as kode,
        a.id_driver as driver_id,
        d.driver as driver_name
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      JOIN detail_antar da ON a.id_detail = da.id
      JOIN ambulan amb ON a.id_ambulan = amb.id
      LEFT JOIN driver d ON a.id_driver = d.id
      WHERE a.id = ${id}
    `

    if (activityResult.length === 0) {
      return null
    }

    const row = activityResult[0]
    const activity: any = {
      id: row.id,
      tgl_berangkat: row.tgl_berangkat,
      tgl_pulang: row.tgl_pulang,
      detail: row.detail,
      dari: row.dari,
      tujuan: row.tujuan,
      jam_berangkat: row.jam_berangkat,
      jam_pulang: row.jam_pulang,
      tipe: row.tipe,
      reward: row.reward,
      km_awal: row.km_awal,
      km_akhir: row.km_akhir,
      nama_pemesan: row.nama_pemesan,
      hp: row.hp,
      nama_pm: row.nama_pm,
      area: row.area,
      asisten_luar_kota: row.asisten_luar_kota,
      alamat_pm: row.alamat_pm,
      jenis_kelamin_pm: row.jenis_kelamin_pm,
      usia_pm: row.usia_pm,
      nik: row.nik,
      no_kk: row.no_kk,
      tempat_lahir: row.tempat_lahir,
      tgl_lahir: row.tgl_lahir,
      status_marital: row.status_marital,
      kegiatan: row.kegiatan,
      rumpun_program: row.rumpun_program,
      diagnosa_sakit: row.diagnosa_sakit,
      agama: row.agama,
      infaq: row.infaq,
      biaya_dibayar: row.biaya_dibayar,
      id_asnaf: row.id_asnaf,
      ambulance: {
        id: row.ambulance_id,
        nopol: row.nopol,
        kode: row.kode,
      },
      user: {
        id: row.driver_id,
        name: row.driver_name || 'Unknown Driver',
      },
    }

    // Get documentation files
    try {
      const documentationResult = await sql`
        SELECT id, url, created_at
        FROM dokumentasi_activity
        WHERE id_activity = ${id}
        ORDER BY created_at ASC
      `
      
      activity.documentation = documentationResult.map((doc: any) => ({
        id: doc.id,
        url: doc.url,
        created_at: doc.created_at
      }))
    } catch (docError) {
      console.error("Error fetching documentation:", docError)
      activity.documentation = []
    }

    return activity
  } catch (error) {
    console.error("Error in getActivityByIdWithDocumentation:", error)
    return null
  }
}

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const activityId = Number.parseInt(params.id)

  if (isNaN(activityId)) {
    notFound()
  }
  
  const activity = await getActivityByIdWithDocumentation(activityId)
  
  if (!activity) {
    notFound()
  }

  // For drivers, check if the activity belongs to them
  // For admins, allow access to all activities
  if (user.role === "driver") {
    // Check if the activity's driver ID matches the current user's driver ID
    // If user.id_driver is null/undefined, fallback to user.id for comparison
    const userDriverId = user.id_driver || user.id
    if (activity.user.id !== userDriverId) {
      notFound()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta", // GMT + 7
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    return timeString.slice(0, 5) // Remove seconds
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Detail Aktivitas</h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            <span>Home</span> <span className="mx-2">/</span>{" "}
            <span className="text-gray-900 font-semibold">Aktivitas</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Informasi Aktivitas</h2>
            <div className="flex gap-2">
              <Link href={`/activities/${activityId}/edit`}>
                <Button variant="outline" className="flex items-center gap-2">
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
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
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                  </svg>
                  Kembali
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tanggal Berangkat</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.tgl_berangkat ? formatDate(activity.tgl_berangkat) : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tanggal Pulang</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.tgl_pulang ? formatDate(activity.tgl_pulang) : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Ambulan (No Plat)</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.ambulance.nopol || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Detail</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.detail || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Jam Berangkat</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.jam_berangkat ? formatTime(activity.jam_berangkat) : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Jam Pulang</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.jam_pulang ? formatTime(activity.jam_pulang) : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Jenis</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.tipe || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Asisten Luar Kota</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.asisten_luar_kota || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Area</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.area || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Dari</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.dari || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tujuan</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.tujuan || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Driver</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.user.name || "-"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama Pemesan</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.nama_pemesan || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">HP</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.hp || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Nama PM</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.nama_pm || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Alamat PM</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.alamat_pm || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Jenis Kelamin PM</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.jenis_kelamin_pm || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Usia PM</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.usia_pm || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Asnaf</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.id_asnaf || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">NIK</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.nik || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">No KK</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.no_kk || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tempat Lahir</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.tempat_lahir || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tanggal Lahir</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.tgl_lahir ? formatDate(activity.tgl_lahir) : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status Marital</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.status_marital || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Kegiatan</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.kegiatan || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Rumpun Program</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.rumpun_program || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">KM Awal</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.km_awal || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">KM Akhir</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.km_akhir || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Biaya Antar</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.reward > 0 ? `Rp ${activity.reward.toLocaleString("id-ID")}` : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Infaq Dibayar</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {(activity.biaya_dibayar || 0) > 0
                    ? `Rp ${(activity.biaya_dibayar || 0).toLocaleString("id-ID")}`
                    : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Infaq</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {(activity.infaq || 0) > 0 ? `Rp ${(activity.infaq || 0).toLocaleString("id-ID")}` : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Diagnosa Sakit</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.diagnosa_sakit || "-"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Agama</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.agama || "-"}</p>
              </div>
            </div>
          </div>
          
          {/* Documentation Section */}
          {activity.documentation && activity.documentation.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dokumentasi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activity.documentation.map((doc: any) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <DocumentationImage
                      src={doc.url}
                      alt={`Dokumentasi aktivitas ${activity.id}`}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
