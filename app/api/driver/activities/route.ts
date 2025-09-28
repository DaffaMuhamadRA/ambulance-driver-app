import { NextResponse } from "next/server"
import { getActivitiesForUser } from "@/lib/activities"
import { getSession } from "@/app/api/auth/session/route"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie: string) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session || session.user.role !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Use the user object to get activities
    // Log the values for debugging
    console.log("Session user:", session.user)
    
    if (!session.user.id_driver) {
      return NextResponse.json({ error: "Driver ID not found in user session" }, { status: 400 })
    }
    
    // Get query parameters for filtering
    const url = new URL(request.url)
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const location = url.searchParams.get('location')
    
    // Build the query with filtering conditions
    let queryConditions = ` AND aa.id_driver = ${session.user.id_driver}`
    const queryParams = []
    
    // Date range filter
    if (dateFrom && dateTo) {
      queryConditions += ` AND aa.tgl BETWEEN '${dateFrom}' AND '${dateTo}'`
    } else if (dateFrom) {
      queryConditions += ` AND aa.tgl >= '${dateFrom}'`
    } else if (dateTo) {
      queryConditions += ` AND aa.tgl <= '${dateTo}'`
    }
    
    // Location filter (from or destination)
    if (location) {
      queryConditions += ` AND (aa.dari ILIKE '%${location}%' OR aa.tujuan ILIKE '%${location}%')`
    }
    
    // Fetch driver activities with related data and filters
    const result = await sql`
      SELECT 
        aa.id,
        aa.tgl as tgl_berangkat,
        aa.tgl_pulang,
        aa.dari,
        aa.tujuan,
        aa.jam_berangkat,
        aa.jam_pulang,
        aa.area,
        aa.asisten_luar_kota,
        aa.km_awal,
        aa.km_akhir,
        p.nama_pemesan,  -- Get from pemesan table
        p.hp,            -- Get from pemesan table
        pm.nama_pm,      -- Get from penerima_manfaat table
        pm.alamat_pm,
        pm.jenis_kelamin_pm,
        pm.usia_pm,
        pm.nik,
        pm.no_kk,
        pm.tempat_lahir,
        pm.tgl_lahir,
        pm.status_marital,
        aa.kegiatan,
        aa.rumpun_program,
        aa.infaq,
        aa.biaya_dibayar,
        pm.id_asnaf,
        da.detail_antar as detail,
        rp.jenis,
        rp.tipe,
        rp.reward,
        a.id as ambulance_id,
        a.nopol as ambulance_nopol,
        '' as ambulance_kode,
        cu.id as user_id,
        cu.name as user_name
      FROM ambulan_activity aa
      LEFT JOIN detail_antar da ON aa.id_detail = da.id
      LEFT JOIN reward_pengantaran rp ON aa.id_reward = rp.id
      LEFT JOIN ambulan a ON aa.id_ambulan = a.id
      LEFT JOIN cms_users cu ON aa.id_driver = cu.id
      LEFT JOIN pemesan p ON aa.id_pemesan = p.id  -- Join with pemesan table
      LEFT JOIN penerima_manfaat pm ON aa.id_penerima_manfaat = pm.id  -- Join with penerima_manfaat table
      WHERE 1=1 ${sql.unsafe(queryConditions)}
      ORDER BY aa.tgl DESC, aa.jam_berangkat DESC
      LIMIT 100
    `
    
    // Transform the flat result into nested objects
    const activities = result.map((row: any) => ({
      id: row.id,
      tgl_berangkat: row.tgl_berangkat,
      tgl_pulang: row.tgl_pulang,
      detail: row.detail || "",
      dari: row.dari || "",
      tujuan: row.tujuan || "",
      jam_berangkat: row.jam_berangkat || "",
      jam_pulang: row.jam_pulang || "",
      tipe: row.tipe || "",
      reward: row.reward || 0,
      km_awal: row.km_awal || 0,
      km_akhir: row.km_akhir || 0,
      nama_pemesan: row.nama_pemesan || "",
      hp: row.hp || "",
      nama_pm: row.nama_pm || "",
      area: row.area || "",
      asisten_luar_kota: row.asisten_luar_kota || "",
      alamat_pm: row.alamat_pm || "",
      jenis_kelamin_pm: row.jenis_kelamin_pm || "",
      usia_pm: row.usia_pm || 0,
      nik: row.nik || "",
      no_kk: row.no_kk || "",
      tempat_lahir: row.tempat_lahir || "",
      tgl_lahir: row.tgl_lahir || "",
      status_marital: row.status_marital || "",
      kegiatan: row.kegiatan || "",
      rumpun_program: row.rumpun_program || "",
      infaq: row.infaq || 0,
      biaya_dibayar: row.biaya_dibayar || 0,
      id_asnaf: row.id_asnaf || 0,
      ambulance: {
        id: row.ambulance_id,
        nopol: row.ambulance_nopol || "",
        kode: row.ambulance_kode || ""
      },
      user: {
        id: row.user_id,
        name: row.user_name || ""
      }
    }))
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching driver activities:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}