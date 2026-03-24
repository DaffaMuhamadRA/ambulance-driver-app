// Test creating a new activity with the enhanced form fields
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testCreateActivityEnhanced() {
  try {
    const sql = neon(connectionString);
    
    // First, get required reference data
    console.log('=== Getting reference data ===');
    const kantor = await sql`SELECT id FROM kantor LIMIT 1`;
    const ambulan = await sql`SELECT id FROM ambulan LIMIT 1`;
    const detail = await sql`SELECT id FROM detail_antar LIMIT 1`;
    const driver = await sql`SELECT id FROM cms_users WHERE id_cms_privileges != 1 LIMIT 1`;
    const asnaf = await sql`SELECT id FROM asnaf LIMIT 1`;
    const reward = await sql`SELECT id FROM reward_pengantaran WHERE jenis = 'karyawan' LIMIT 1`;
    
    if (!kantor[0] || !ambulan[0] || !detail[0] || !driver[0] || !asnaf[0] || !reward[0]) {
      console.log('Missing required reference data');
      return;
    }
    
    const id_kantor = kantor[0].id;
    const id_ambulan = ambulan[0].id;
    const id_detail = detail[0].id;
    const id_driver = driver[0].id;
    const id_asnaf = asnaf[0].id;
    const id_reward = reward[0].id;
    
    console.log('Reference data:', { id_kantor, id_ambulan, id_detail, id_driver, id_asnaf, id_reward });
    
    // Test creating a new activity with enhanced fields
    console.log('=== Creating new activity with enhanced fields ===');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Tomorrow
    
    const result = await sql`
      INSERT INTO ambulan_activity (
        id_kantor,
        tgl,
        tgl_pulang,
        bulan,
        tahun,
        id_ambulan,
        id_detail,
        jam_berangkat,
        jam_pulang,
        id_driver,
        asisten_luar_kota,
        area,
        jml_hari_luar_kota,
        dari,
        tujuan,
        km_awal,
        km_akhir,
        selisih_km,
        biaya_antar,
        biaya_dibayar,
        id_pemesan,
        id_penerima_manfaat,
        status_layanan,
        pembatalan,
        keterbatasan,
        infaq,
        id_reward,
        reward_driver,
        reward_asisten,
        kegiatan,
        rumpun_program,
        diagnosa_sakit,
        tgl_insert
      )
      VALUES (
        ${id_kantor},
        ${today},  -- tgl_berangkat
        ${tomorrow},  -- tgl_pulang
        9,
        2025,
        ${id_ambulan},
        ${id_detail},
        '09:00',  -- Without seconds
        '11:00',  -- Without seconds
        ${id_driver},
        NULL,
        'Dalam Kota',
        0,
        'Test dari',
        'Test tujuan',
        1000,
        1020,
        20,
        50000,
        NULL,
        NULL,  -- id_pemesan
        NULL,  -- id_penerima_manfaat
        'Selesai',
        'Tidak',
        'Tidak',
        NULL,
        ${id_reward},
        0,
        0,
        'pengantaran',
        'kesehatan',
        NULL,
        NOW()
      )
      RETURNING id
    `;
    
    console.log('Created activity with ID:', result[0].id);
    
    // Retrieve the created activity to verify the fields
    console.log('=== Retrieving created activity ===');
    const activityResult = await sql`
      SELECT 
        id,
        tgl as tgl_berangkat,
        tgl_pulang,
        jam_berangkat,
        jam_pulang,
        area,
        id_reward
      FROM ambulan_activity 
      WHERE id = ${result[0].id}
    `;
    
    console.log('Retrieved activity:', activityResult[0]);
    
    // Clean up - delete the test activity
    await sql`
      DELETE FROM ambulan_activity WHERE id = ${result[0].id}
    `;
    
    console.log('Cleaned up test activity');
    
  } catch (error) {
    console.error('Error testing enhanced activity creation:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testCreateActivityEnhanced();
}

module.exports = { testCreateActivityEnhanced };
