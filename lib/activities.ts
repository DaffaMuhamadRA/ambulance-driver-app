import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Activity {
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
  ambulance: {
    id: number
    nopol: string
    kode: string
  }
  user: {
    id: number
    full_name: string
  }
}

// Get activities for a specific driver
export async function getActivities(userId: number): Promise<Activity[]> {
  const result = await sql`
    SELECT 
      a.id, a.tgl_berangkat, a.tgl_pulang, a.detail, a.dari, a.tujuan,
      a.jam_berangkat, a.jam_pulang, a.tipe, a.reward,
      amb.id as ambulance_id, amb.nopol, amb.kode,
      u.id as user_id, u.full_name
    FROM activities a
    JOIN ambulances amb ON a.ambulance_id = amb.id
    JOIN users u ON a.user_id = u.id
    WHERE a.user_id = ${userId}
    ORDER BY a.tgl_berangkat DESC, a.jam_berangkat DESC
  `

  return result.map((row) => ({
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
    ambulance: {
      id: row.ambulance_id,
      nopol: row.nopol,
      kode: row.kode,
    },
    user: {
      id: row.user_id,
      full_name: row.full_name,
    },
  }))
}

// Get all activities (for admin)
export async function getAllActivities(): Promise<Activity[]> {
  const result = await sql`
    SELECT 
      a.id, a.tgl_berangkat, a.tgl_pulang, a.detail, a.dari, a.tujuan,
      a.jam_berangkat, a.jam_pulang, a.tipe, a.reward,
      amb.id as ambulance_id, amb.nopol, amb.kode,
      u.id as user_id, u.full_name
    FROM activities a
    JOIN ambulances amb ON a.ambulance_id = amb.id
    JOIN users u ON a.user_id = u.id
    ORDER BY a.tgl_berangkat DESC, a.jam_berangkat DESC
  `

  return result.map((row) => ({
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
    ambulance: {
      id: row.ambulance_id,
      nopol: row.nopol,
      kode: row.kode,
    },
    user: {
      id: row.user_id,
      full_name: row.full_name,
    },
  }))
}
