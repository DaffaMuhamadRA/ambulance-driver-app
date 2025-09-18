// Test the getActivityByIdWithReferences function
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Mock the sql function to use neon directly
const sql = neon(connectionString);

// Copy the getActivityByIdWithReferences function here for testing
async function getActivityByIdWithReferences(id) {
  try {
    console.log("Fetching activity with ID:", id);
    
    const result = await sql`
      SELECT 
        a.id, a.tgl as tgl, a.tgl_pulang, da.detail_antar as detail, a.dari,
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
        d.driver as driver_name,
        a.id_kantor, a.id_ambulan, a.id_detail, a.id_pemesan, a.id_penerima_manfaat, 
        a.id_reward, a.biaya_antar
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      JOIN detail_antar da ON a.id_detail = da.id
      JOIN ambulan amb ON a.id_ambulan = amb.id
      LEFT JOIN driver d ON a.id_driver = d.id
      WHERE a.id = ${id}
    `

    console.log("Query result length:", result.length);
    
    if (result.length === 0) {
      console.log("No activity found with ID:", id);
      return null;
    }

    const row = result[0];
    console.log("Raw row data:", JSON.stringify(row, null, 2));
    
    // Get documentation files
    const documentationResult = await sql`
      SELECT id, url, created_at
      FROM dokumentasi_activity
      WHERE id_activity = ${id}
      ORDER BY created_at ASC
    `
    
    console.log("Documentation result length:", documentationResult.length);
    
    // Format tanggal untuk input HTML (YYYY-MM-DD) using GMT + 7
    const formatDateForInput = (dateValue) => {
      // Handle null or undefined
      if (!dateValue) return "";
      
      try {
        let date;
        
        // If it's already a Date object, use it directly
        if (dateValue instanceof Date) {
          date = dateValue;
        } else {
          // Parse the string date
          date = new Date(dateValue);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("Invalid date value:", dateValue);
          return "";
        }
        
        // For HTML date inputs, we want to use the GMT + 7 date to match the detail views
        // Convert to GMT + 7 and get the date part
        const gmtPlus7Date = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const year = gmtPlus7Date.getFullYear();
        const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error("Error formatting date for input:", dateValue, error);
        return "";
      }
    };
    
    // Add error handling for date formatting
    let tgl_berangkat = "";
    let tgl_pulang = "";
    
    try {
      tgl_berangkat = formatDateForInput(row.tgl);
      console.log("Formatted tgl_berangkat:", tgl_berangkat);
    } catch (error) {
      console.error("Error formatting tgl_berangkat:", error);
      // Fallback to GMT + 7 date handling
      if (row.tgl) {
        if (row.tgl instanceof Date) {
          const gmtPlus7Date = new Date(row.tgl.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
          const year = gmtPlus7Date.getFullYear();
          const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
          const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
          tgl_berangkat = `${year}-${month}-${day}`;
        } else {
          const date = new Date(row.tgl);
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
      tgl_pulang = formatDateForInput(row.tgl_pulang);
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
    
    return {
      id: row.id,
      tgl_berangkat: tgl_berangkat,
      tgl_pulang: tgl_pulang,
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
      infaq: row.infaq !== null ? row.infaq : null,
      biaya_dibayar: row.biaya_dibayar !== null ? row.biaya_dibayar : null,
      id_asnaf: row.id_asnaf,
      id_kantor: row.id_kantor,
      id_ambulan: row.id_ambulan,
      id_detail: row.id_detail,
      id_driver: row.id_driver,
      id_pemesan: row.id_pemesan,
      id_penerima_manfaat: row.id_penerima_manfaat,
      id_reward: row.id_reward,
      biaya_antar: row.biaya_antar,
      ambulance: {
        id: row.ambulance_id,
        nopol: row.nopol,
        kode: row.kode,
      },
      user: {
        id: row.driver_id,
        name: row.driver_name || 'Unknown Driver',
      },
      documentation: documentationResult.map((doc) => ({
        id: doc.id,
        url: doc.url,
        created_at: doc.created_at
      }))
    };
  } catch (error) {
    console.error("Error in getActivityByIdWithReferences:", error);
    throw error;
  }
}

async function testGetActivityById() {
  try {
    console.log('Testing getActivityByIdWithReferences for activity ID 70...');
    const activity = await getActivityByIdWithReferences(70);
    
    if (activity) {
      console.log('Activity found:');
      console.log('ID:', activity.id);
      console.log('Tanggal berangkat:', activity.tgl_berangkat);
      console.log('Tanggal pulang:', activity.tgl_pulang);
      console.log('Nama pemesan:', activity.nama_pemesan);
      console.log('Nama PM:', activity.nama_pm);
    } else {
      console.log('No activity found with ID 70');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGetActivityById();