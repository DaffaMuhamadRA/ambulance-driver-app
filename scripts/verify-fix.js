// Verify that our database fix is working
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function verifyFix() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Verifying Database Fix ===');
    
    // Test the exact query that was failing
    console.log('Testing the fixed query...');
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
            WHEN a.usia_pm ~ '^[0-9]+$' THEN a.usia_pm::INTEGER
            ELSE NULL
          END) as usia_pm, 
        COALESCE(pm.nik, a.nik) as nik, 
        COALESCE(pm.no_kk, a.no_kk) as no_kk, 
        COALESCE(pm.tempat_lahir, a.tempat_lahir) as tempat_lahir, 
        COALESCE(pm.tgl_lahir, 
          CASE 
            WHEN a.tgl_lahir ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN a.tgl_lahir::DATE
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
        u.id as user_id, u.name
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      JOIN detail_antar da ON a.id_detail = da.id
      JOIN ambulan amb ON a.id_ambulan = amb.id
      JOIN cms_users u ON a.id_driver = u.id
      ORDER BY a.tgl DESC, a.jam_berangkat DESC
      LIMIT 3
    `;
    
    console.log('✅ Query executed successfully!');
    console.log('Retrieved', result.length, 'records');
    console.log('Sample record ID:', result[0]?.id);
    
    // Test the admin API route query specifically
    console.log('\nTesting admin API route query...');
    const adminResult = await sql`
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
            WHEN a.usia_pm ~ '^[0-9]+$' THEN a.usia_pm::INTEGER
            ELSE NULL
          END) as usia_pm, 
        COALESCE(pm.nik, a.nik) as nik, 
        COALESCE(pm.no_kk, a.no_kk) as no_kk, 
        COALESCE(pm.tempat_lahir, a.tempat_lahir) as tempat_lahir, 
        COALESCE(pm.tgl_lahir, 
          CASE 
            WHEN a.tgl_lahir ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN a.tgl_lahir::DATE
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
        u.id as user_id, u.name
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      JOIN detail_antar da ON a.id_detail = da.id
      JOIN ambulan amb ON a.id_ambulan = amb.id
      JOIN cms_users u ON a.id_driver = u.id
      ORDER BY a.tgl DESC, a.jam_berangkat DESC
    `;
    
    console.log('✅ Admin API query executed successfully!');
    console.log('Total activities:', adminResult.length);
    
    console.log('\n🎉 All fixes verified successfully!');
    
  } catch (error) {
    console.error('❌ Error verifying fix:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  verifyFix();
}

module.exports = { verifyFix };