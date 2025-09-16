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
}

// Get activities for a specific driver
export async function getActivities(userId: number): Promise<Activity[]> {
  const result = await sql`
    SELECT 
      a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
      a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
      a.km_awal, a.km_akhir, a.nama_pemesan, a.hp, a.nama_pm, a.area, a.asisten_luar_kota,
      a.alamat_pm, a.jenis_kelamin_pm, a.usia_pm, a.nik, a.no_kk, a.tempat_lahir, a.tgl_lahir,
      a.status_marital, a.kegiatan, a.rumpun_program, a.diagnosa_sakit, a.agama, a.infaq,
      a.biaya_dibayar, a.id_asnaf,
      amb.id as ambulance_id, amb.nopol, '' as kode,
      u.id as user_id, u.name
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
      id: row.user_id,
      name: row.name,
    },
  }))
}

// Get all activities (for admin)
export async function getAllActivities(): Promise<Activity[]> {
  const result = await sql`
    SELECT 
      a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
      a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
      a.km_awal, a.km_akhir, a.nama_pemesan, a.hp, a.nama_pm, a.area, a.asisten_luar_kota,
      a.alamat_pm, a.jenis_kelamin_pm, a.usia_pm, a.nik, a.no_kk, a.tempat_lahir, a.tgl_lahir,
      a.status_marital, a.kegiatan, a.rumpun_program, a.diagnosa_sakit, a.agama, a.infaq,
      a.biaya_dibayar, a.id_asnaf,
      amb.id as ambulance_id, amb.nopol, '' as kode,
      u.id as user_id, u.name
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
      id: row.user_id,
      name: row.name,
    },
  }))
}

// Get activity by ID
export async function getActivityById(id: number): Promise<Activity | null> {
  const result = await sql`
    SELECT 
      a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
      a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
      a.km_awal, a.km_akhir, a.nama_pemesan, a.hp, a.nama_pm, a.area, a.asisten_luar_kota,
      a.alamat_pm, a.jenis_kelamin_pm, a.usia_pm, a.nik, a.no_kk, a.tempat_lahir, a.tgl_lahir,
      a.status_marital, a.kegiatan, a.rumpun_program, a.diagnosa_sakit, a.agama, a.infaq,
      a.biaya_dibayar, a.id_asnaf,
      amb.id as ambulance_id, amb.nopol, '' as kode,
      u.id as user_id, u.name
    FROM ambulan_activity a
    JOIN detail_antar da ON a.id_detail = da.id
    JOIN ambulan amb ON a.id_ambulan = amb.id
    JOIN cms_users u ON a.id_driver = u.id
    WHERE a.id = ${id}
  `

  if (result.length === 0) {
    return null
  }

  const row = result[0]
  return {
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
      id: row.user_id,
      name: row.name,
    },
  }
}