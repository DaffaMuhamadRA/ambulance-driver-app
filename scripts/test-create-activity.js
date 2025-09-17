// Test creating a new activity
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testCreateActivity() {
  try {
    const sql = neon(connectionString);
    
    // First, get required reference data
    console.log('=== Getting reference data ===');
    const kantor = await sql`SELECT id FROM kantor LIMIT 1`;
    const ambulan = await sql`SELECT id FROM ambulan LIMIT 1`;
    const detail = await sql`SELECT id FROM detail_antar LIMIT 1`;
    const driver = await sql`SELECT id FROM cms_users WHERE id_cms_privileges != 1 LIMIT 1`;
    const asnaf = await sql`SELECT id FROM asnaf LIMIT 1`;
    
    if (!kantor[0] || !ambulan[0] || !detail[0] || !driver[0] || !asnaf[0]) {
      console.log('Missing required reference data');
      return;
    }
    
    const id_kantor = kantor[0].id;
    const id_ambulan = ambulan[0].id;
    const id_detail = detail[0].id;
    const id_driver = driver[0].id;
    const id_asnaf = asnaf[0].id;
    
    console.log('Reference data:', { id_kantor, id_ambulan, id_detail, id_driver, id_asnaf });
    
    // Test creating a new activity
    console.log('=== Creating new activity ===');
    const today = new Date().toISOString().split('T')[0];
    
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
        nama_pemesan,
        hp,
        nama_pm,
        alamat_pm,
        nik,
        no_kk,
        tempat_lahir,
        tgl_lahir,
        jenis_kelamin_pm,
        usia_pm,
        id_asnaf,
        status_layanan,
        pembatalan,
        keterbatasan,
        infaq,
        agama,
        status_marital,
        kegiatan,
        rumpun_program,
        diagnosa_sakit,
        tgl_insert
      )
      VALUES (
        ${id_kantor},
        ${today},
        ${today},
        9,
        2025,
        ${id_ambulan},
        ${id_detail},
        '09:00:00',
        '11:00:00',
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
        'Test Pemesan',
        '08123456789',
        'Test PM',
        'Test Alamat',
        '1234567890123456',
        '1234567890123456',
        'Bandung',
        '1990-01-01',
        'Laki-laki',
        '30',
        ${id_asnaf},
        'Selesai',
        'Tidak',
        'Tidak',
        NULL,
        'Islam',
        'Menikah',
        'pengantaran',
        'kesehatan',
        NULL,
        NOW()
      )
      RETURNING id
    `;
    
    console.log('Created activity with ID:', result[0].id);
    
    // Clean up - delete the test activity
    await sql`
      DELETE FROM ambulan_activity WHERE id = ${result[0].id}
    `;
    
    console.log('Cleaned up test activity');
    
  } catch (error) {
    console.error('Error testing activity creation:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testCreateActivity();
}

module.exports = { testCreateActivity };