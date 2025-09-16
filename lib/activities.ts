import { sql } from "./db";

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
  km_awal: number
  km_akhir: number
  nama_pemesan: string
  hp: string
  nama_pm: string
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
      a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
      a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
      a.km_awal, a.km_akhir, a.nama_pemesan, a.hp, a.nama_pm,
      amb.id as ambulance_id, amb.nopol, '' as kode,
      u.id as user_id, u.name as full_name
    FROM ambulan_activity a
    JOIN detail_antar da ON a.id_detail = da.id
    JOIN ambulan amb ON a.id_ambulan = amb.id
    JOIN cms_users u ON a.id_driver = u.id
    WHERE a.id_driver = ${userId}
    ORDER BY a.tgl DESC, a.jam_berangkat DESC
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
    km_awal: row.km_awal,
    km_akhir: row.km_akhir,
    nama_pemesan: row.nama_pemesan,
    hp: row.hp,
    nama_pm: row.nama_pm,
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
      a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
      a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
      a.km_awal, a.km_akhir, a.nama_pemesan, a.hp, a.nama_pm,
      amb.id as ambulance_id, amb.nopol, '' as kode,
      u.id as user_id, u.name as full_name
    FROM ambulan_activity a
    JOIN detail_antar da ON a.id_detail = da.id
    JOIN ambulan amb ON a.id_ambulan = amb.id
    JOIN cms_users u ON a.id_driver = u.id
    ORDER BY a.tgl DESC, a.jam_berangkat DESC
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
    km_awal: row.km_awal,
    km_akhir: row.km_akhir,
    nama_pemesan: row.nama_pemesan,
    hp: row.hp,
    nama_pm: row.nama_pm,
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