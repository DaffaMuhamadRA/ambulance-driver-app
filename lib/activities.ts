import { sql } from "@/lib/db"
import { formatInputDate } from "@/lib/timezone"
import { User } from "@/lib/auth"

// Original Activity interface for database operations
export interface Activity {
  id: number;
  id_kantor: number;
  tgl: Date;
  tgl_pulang: Date | null;
  bulan: number | null;
  tahun: number | null;
  id_ambulan: number;
  id_detail: number | null;
  jam_berangkat: string | null;
  jam_pulang: string | null;
  id_driver: number | null;
  asisten_luar_kota: string | null;
  area: string | null;
  jml_hari_luar_kota: number | null;
  dari: string | null;
  tujuan: string | null;
  km_awal: number | null;
  km_akhir: number | null;
  selisih_km: number | null;
  biaya_antar: number | null;
  biaya_dibayar: number | null;
  id_pemesan: number | null;
  id_penerima_manfaat: number | null;
  status_layanan: string | null;
  pembatalan: string | null;
  keterbatasan: string | null;
  infaq: number | null;
  tgl_insert: Date | null;
  id_reward: number | null;
  reward_driver: number | null;
  reward_asisten: number | null;
  kegiatan: string | null;
  rumpun_program: string | null;
  diagnosa_sakit: string | null;
  id_driver_erpwh: number | null;
  id_kantor_erpwh: number | null;
  id_unit_erpwh: number | null;
  id_reward_erpwh: number | null;
  tgl_berangkat_erpwh: Date | null;
  tgl_pulang_erpwh: Date | null;
  id_pm_erpwh: number | null;
  jenis_kelamin_erpwh: string | null;
  asnaf_erpwh: string | null;
  jenis_antar_erpwh: string | null;
  status_marital_erpwh: string | null;
  tgl_lahir_erpwh: Date | null;
  alamat_erpwh: string | null;
}

// Dashboard Activity interface for frontend display
export interface DashboardActivity {
  id: number;
  tgl_berangkat: string;
  tgl_pulang: string;
  detail: string;
  dari: string;
  tujuan: string;
  jam_berangkat: string;
  jam_pulang: string;
  tipe: string;
  reward: number;
  km_awal: number;
  km_akhir: number;
  nama_pemesan: string;
  hp: string;
  nama_pm: string;
  area?: string;
  asisten_luar_kota?: string;
  alamat_pm?: string;
  jenis_kelamin_pm?: string;
  usia_pm?: number;
  nik?: string;
  no_kk?: string;
  tempat_lahir?: string;
  tgl_lahir?: string;
  status_marital?: string;
  kegiatan?: string;
  rumpun_program?: string;
  diagnosa_sakit?: string;
  agama?: string;
  infaq?: number;
  biaya_dibayar?: number;
  id_asnaf?: number;
  ambulance: {
    id: number;
    nopol: string;
    kode: string;
  };
  user: {
    id: number;
    name: string;
  };
}

// Detailed Activity interface for activity detail page
export interface DetailedActivity extends DashboardActivity {
  id_kantor: number;
  id_ambulan: number;
  id_detail: number | null;
  id_driver: number | null;
  id_pemesan: number | null;
  id_penerima_manfaat: number | null;
  id_reward: number | null;
  biaya_antar: number | null;
  documentation: {
    id: number;
    url: string;
    created_at: string;
  }[];
}

// Get activities based on user role
export async function getActivitiesForUser(user: User, limit: number = 100, offset: number = 0): Promise<DashboardActivity[]> {
  try {
    let result: any[];
    
    if (user.role === "admin") {
      // Admin can see all activities with related data
      result = await sql`
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
        ORDER BY aa.tgl DESC, aa.jam_berangkat DESC
        LIMIT ${limit} 
        OFFSET ${offset}
      `;
      
      // Transform the flat result into nested objects for admin
      return result.map((row: any) => ({
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
      }));
    } else if (user.role === "driver" && user.id_driver) {
      // Driver can only see their own activities with related data
      result = await sql`
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
        WHERE aa.id_driver = ${user.id_driver} 
        ORDER BY aa.tgl DESC, aa.jam_berangkat DESC
        LIMIT ${limit} 
        OFFSET ${offset}
      `;
      
      // Transform the flat result into nested objects for driver
      return result.map((row: any) => ({
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
      }));
    } else {
      // Driver without id_driver mapping - return empty array
      return [];
    }
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Failed to fetch activities");
  }
}

// Get activity by ID with authorization check
export async function getActivityById(user: User, id: number): Promise<Activity | null> {
  try {
    let result: any[];
    
    if (user.role === "admin") {
      // Admin can see any activity
      result = await sql`
        SELECT * 
        FROM ambulan_activity 
        WHERE id = ${id}
      `;
    } else if (user.role === "driver" && user.id_driver) {
      // Driver can only see their own activities
      result = await sql`
        SELECT * 
        FROM ambulan_activity 
        WHERE id = ${id} 
        AND id_driver = ${user.id_driver}
      `;
    } else {
      // Driver without id_driver mapping
      result = [];
    }
    
    return result.length > 0 ? (result[0] as Activity) : null;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch activity");
  }
}

// Get activity by ID with all related references (for detail page)
export async function getActivityByIdWithReferences(id: number): Promise<DetailedActivity | null> {
  try {
    console.log("getActivityByIdWithReferences called with ID:", id);
    
    const result = await sql`
      SELECT 
        a.id, a.tgl as tgl_berangkat, a.tgl_pulang, da.detail_antar as detail, a.dari,
        a.tujuan, a.jam_berangkat, a.jam_pulang, 'Ambulan' as tipe, a.biaya_antar as reward,
        a.km_awal, a.km_akhir, 
        p.nama_pemesan, 
        p.hp, 
        pm.nama_pm, 
        a.area, a.asisten_luar_kota,
        pm.alamat_pm, 
        pm.jenis_kelamin_pm, 
        pm.usia_pm,
        pm.nik, 
        pm.no_kk, 
        pm.tempat_lahir, 
        pm.tgl_lahir,
        pm.status_marital, 
        a.kegiatan, a.rumpun_program, a.diagnosa_sakit, 
        pm.agama, 
        a.infaq, a.biaya_dibayar, 
        pm.id_asnaf,
        amb.id as ambulance_id, amb.nopol, '' as kode,
        a.id_driver as driver_id,
        d.driver as driver_name,
        a.id_kantor, a.id_ambulan, a.id_detail, a.id_pemesan, a.id_penerima_manfaat, 
        a.id_reward, a.biaya_antar
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      LEFT JOIN detail_antar da ON a.id_detail = da.id
      LEFT JOIN ambulan amb ON a.id_ambulan = amb.id
      LEFT JOIN driver d ON a.id_driver = d.id
      WHERE a.id = ${id}
    `

    console.log("Main query result length:", result.length);
    
    if (result.length === 0) {
      console.log("No activity found with ID:", id);
      return null;
    }

    const row = result[0];
    console.log("Raw row data keys:", Object.keys(row));
    
    // Get documentation files
    console.log("Fetching documentation for activity ID:", id);
    const documentationResult = await sql`
      SELECT id, url, created_at
      FROM dokumentasi_activity
      WHERE id_activity = ${id}
      ORDER BY created_at ASC
    `
    
    console.log("Documentation result length:", documentationResult.length);
    
    // Format tanggal untuk input HTML (YYYY-MM-DD) using GMT + 7
    // Using the new utility function
    let tgl_berangkat = "";
    let tgl_pulang = "";
    
    try {
      tgl_berangkat = formatInputDate(row.tgl_berangkat);
      console.log("Formatted tgl_berangkat:", tgl_berangkat);
    } catch (error) {
      console.error("Error formatting tgl_berangkat:", error);
      // Fallback to GMT + 7 date handling
      if (row.tgl_berangkat) {
        if (row.tgl_berangkat instanceof Date) {
          const gmtPlus7Date = new Date(row.tgl_berangkat.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
          const year = gmtPlus7Date.getFullYear();
          const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
          const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
          tgl_berangkat = `${year}-${month}-${day}`;
        } else {
          const date = new Date(row.tgl_berangkat);
          if (!isNaN(date.getTime())) {
            const gmtPlus7Date = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            const year = gmtPlus7Date.getFullYear();
            const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
            const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
            tgl_berangkat = `${year}-${month}-${day}`;
          }
        }
      }
    }
    
    try {
      tgl_pulang = formatInputDate(row.tgl_pulang);
      console.log("Formatted tgl_pulang:", tgl_pulang);
    } catch (error) {
      console.error("Error formatting tgl_pulang:", error);
      // Fallback to GMT + 7 date handling
      if (row.tgl_pulang) {
        if (row.tgl_pulang instanceof Date) {
          const gmtPlus7Date = new Date(row.tgl_pulang.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
          const year = gmtPlus7Date.getFullYear();
          const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
          const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
          tgl_pulang = `${year}-${month}-${day}`;
        } else {
          const date = new Date(row.tgl_pulang);
          if (!isNaN(date.getTime())) {
            const gmtPlus7Date = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
            const year = gmtPlus7Date.getFullYear();
            const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
            const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
            tgl_pulang = `${year}-${month}-${day}`;
          }
        }
      }
    }
    
    // Log values that might cause issues
    console.log("Driver ID:", row.driver_id);
    console.log("Driver Name:", row.driver_name);
    
    const detailedActivity: DetailedActivity = {
      id: row.id,
      tgl_berangkat: tgl_berangkat,
      tgl_pulang: tgl_pulang,
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
      diagnosa_sakit: row.diagnosa_sakit || "",
      agama: row.agama || "",
      infaq: row.infaq !== null ? row.infaq : null,
      biaya_dibayar: row.biaya_dibayar !== null ? row.biaya_dibayar : null,
      id_asnaf: row.id_asnaf || 0,
      id_kantor: row.id_kantor,
      id_ambulan: row.id_ambulan,
      id_detail: row.id_detail,
      id_driver: row.driver_id,  // Fixed: was row.id_driver, now row.driver_id
      id_pemesan: row.id_pemesan,
      id_penerima_manfaat: row.id_penerima_manfaat,
      id_reward: row.id_reward,
      biaya_antar: row.biaya_antar,
      ambulance: {
        id: row.ambulance_id,
        nopol: row.nopol || "",
        kode: row.kode || "",
      },
      user: {
        id: row.driver_id || 0,
        name: row.driver_name || 'Unknown Driver',
      },
      documentation: documentationResult.map((doc: any) => ({
        id: doc.id,
        url: doc.url,
        created_at: doc.created_at
      }))
    };
    
    console.log("Returning detailed activity:", detailedActivity.id);
    return detailedActivity;
  } catch (error: any) {
    console.error("Error in getActivityByIdWithReferences:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

// Get total count of activities for pagination
export async function getActivityCountForUser(user: User): Promise<number> {
  try {
    let result: any[];
    
    if (user.role === "admin") {
      // Admin can see all activities
      result = await sql`
        SELECT COUNT(*) as count 
        FROM ambulan_activity
      `;
    } else if (user.role === "driver" && user.id_driver) {
      // Driver can only see their own activities
      result = await sql`
        SELECT COUNT(*) as count 
        FROM ambulan_activity 
        WHERE id_driver = ${user.id_driver}
      `;
    } else {
      // Driver without id_driver mapping
      result = [{ count: 0 }];
    }
    
    return parseInt(result[0].count);
  } catch (error) {
    console.error("Error fetching activity count:", error);
    throw new Error("Failed to fetch activity count");
  }
}
