const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testAdminActivitiesQuery() {
  try {
    const sql = neon(connectionString);
    
    console.log("Testing admin activities query...");
    
    // Test the exact query from the route (corrected version)
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
      ORDER BY aa.tgl DESC, aa.jam_berangkat DESC
      LIMIT 100
    `;
    
    console.log("Query executed successfully!");
    console.log(`Found ${result.length} activities`);
    
    if (result.length > 0) {
      console.log("First activity:", result[0]);
    }
    
  } catch (error) {
    console.error("Error executing query:", error.message);
    console.error("Error code:", error.code);
    console.error("Error detail:", error.detail);
    console.error("Error hint:", error.hint);
  }
}

testAdminActivitiesQuery();