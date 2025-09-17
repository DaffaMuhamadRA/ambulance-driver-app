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
export async function getActivities(driverId: number): Promise<Activity[]> {
  console.log("Fetching activities for driver ID:", driverId)
  
  const result = await sql`
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
    WHERE a.id_driver = ${driverId}
    ORDER BY a.tgl DESC, a.jam_berangkat DESC
  `
  
  console.log(`Found ${result.length} activities for driver ${driverId}`)
  
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
      id: row.driver_id,
      name: row.driver_name || 'Unknown Driver',
    },
  }))
}

// Get all activities (for admin)
export async function getAllActivities(): Promise<Activity[]> {
  const result = await sql`
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
      id: row.driver_id,
      name: row.driver_name || 'Unknown Driver',
    },
  }))
}

// Get activity by ID
export async function getActivityById(id: number): Promise<Activity | null> {
  const result = await sql`
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
      id: row.driver_id,
      name: row.driver_name || 'Unknown Driver',
    },
  }
}
