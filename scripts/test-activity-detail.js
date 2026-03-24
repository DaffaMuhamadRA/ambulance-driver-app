const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Mock the sql function to use neon directly
const sql = neon(connectionString);

async function getActivityByIdWithReferences(id) {
  try {
    console.log("Fetching activity with ID:", id);
    
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
      tgl_berangkat = formatDateForInput(row.tgl_berangkat);
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
      id_driver: row.id_driver,
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

async function testActivityDetail() {
  try {
    console.log('Testing getActivityByIdWithReferences for activity ID 8488...');
    const activity = await getActivityByIdWithReferences(8488);
    
    if (activity) {
      console.log('Activity found:');
      console.log('ID:', activity.id);
      console.log('Tanggal berangkat:', activity.tgl_berangkat);
      console.log('Nama pemesan:', activity.nama_pemesan);
      console.log('Nama PM:', activity.nama_pm);
      console.log('Detail:', activity.detail);
      console.log('Documentation count:', activity.documentation.length);
      console.log('Documentation:', JSON.stringify(activity.documentation, null, 2));
    } else {
      console.log('No activity found with ID 8488');
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testActivityDetail();
