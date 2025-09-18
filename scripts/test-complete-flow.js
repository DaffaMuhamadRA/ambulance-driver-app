// Test the complete flow: create pemesan -> create penerima_manfaat -> create activity
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testCompleteFlow() {
  let pemesanId = null;
  let pmId = null;
  let activityId = null;
  
  const sql = neon(connectionString);
  
  try {
    console.log('=== Testing Complete Flow ===');
    
    // Step 1: Create a pemesan
    console.log('\n--- Step 1: Creating pemesan ---');
    const pemesanResult = await sql`
      INSERT INTO pemesan (nama_pemesan, hp)
      VALUES ('Test Pemesan Flow', '081234567890')
      RETURNING id, nama_pemesan, hp
    `;
    
    pemesanId = pemesanResult[0].id;
    console.log('Created pemesan:', pemesanResult[0]);
    
    // Step 2: Create a penerima_manfaat
    console.log('\n--- Step 2: Creating penerima_manfaat ---');
    const pmResult = await sql`
      INSERT INTO penerima_manfaat (
        nama_pm, 
        alamat_pm, 
        jenis_kelamin_pm, 
        usia_pm, 
        id_asnaf, 
        nik, 
        no_kk, 
        tempat_lahir, 
        tgl_lahir, 
        status_marital, 
        agama
      )
      VALUES (
        'Test PM Flow', 
        'Jl. Test Flow', 
        'Laki-laki', 
        35, 
        1, 
        '1234567890123456', 
        '1234567890123456', 
        'Bandung', 
        '1990-01-01', 
        'Menikah', 
        'Islam'
      )
      RETURNING id, nama_pm
    `;
    
    pmId = pmResult[0].id;
    console.log('Created penerima_manfaat:', pmResult[0]);
    
    // Step 3: Get required reference data
    console.log('\n--- Step 3: Getting reference data ---');
    const kantor = await sql`SELECT id FROM kantor LIMIT 1`;
    const ambulan = await sql`SELECT id FROM ambulan LIMIT 1`;
    const detail = await sql`SELECT id FROM detail_antar LIMIT 1`;
    const driver = await sql`SELECT id FROM cms_users WHERE id_cms_privileges != 1 LIMIT 1`;
    const asnaf = await sql`SELECT id FROM asnaf LIMIT 1`;
    
    if (!kantor[0] || !ambulan[0] || !detail[0] || !driver[0] || !asnaf[0]) {
      throw new Error('Missing required reference data');
    }
    
    const id_kantor = kantor[0].id;
    const id_ambulan = ambulan[0].id;
    const id_detail = detail[0].id;
    const id_driver = driver[0].id;
    const id_asnaf = asnaf[0].id;
    
    console.log('Reference data:', { id_kantor, id_ambulan, id_detail, id_driver, id_asnaf });
    
    // Step 4: Create an activity using the created pemesan and penerima_manfaat
    console.log('\n--- Step 4: Creating activity ---');
    const today = new Date().toISOString().split('T')[0];
    
    const activityResult = await sql`
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
        id_pemesan,
        id_penerima_manfaat,
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
        '10:00:00',
        '12:00:00',
        ${id_driver},
        NULL,
        'Dalam Kota',
        0,
        'Test dari Flow',
        'Test tujuan Flow',
        2000,
        2025,
        25,
        60000,
        NULL,
        'Test Pemesan Flow',
        '081234567890',
        'Test PM Flow',
        'Jl. Test Flow',
        '1234567890123456',
        '1234567890123456',
        'Bandung',
        '1990-01-01',
        'Laki-laki',
        '35',
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
        ${pemesanId},
        ${pmId},
        NOW()
      )
      RETURNING id
    `;
    
    activityId = activityResult[0].id;
    console.log('Created activity with ID:', activityId);
    
    // Step 5: Verify the created activity
    console.log('\n--- Step 5: Verifying created activity ---');
    const verifyResult = await sql`
      SELECT 
        a.id,
        a.tgl,
        a.dari,
        a.tujuan,
        p.nama_pemesan,
        pm.nama_pm
      FROM ambulan_activity a
      LEFT JOIN pemesan p ON a.id_pemesan = p.id
      LEFT JOIN penerima_manfaat pm ON a.id_penerima_manfaat = pm.id
      WHERE a.id = ${activityId}
    `;
    
    if (verifyResult.length > 0) {
      console.log('Verified activity:', verifyResult[0]);
    } else {
      console.log('Activity not found');
    }
    
    console.log('\n=== Complete flow test successful ===');
    
  } catch (error) {
    console.error('Error in complete flow test:', error.message);
  } finally {
    // Clean up created records
    console.log('\n--- Cleaning up ---');
    try {
      if (activityId) {
        await sql`DELETE FROM ambulan_activity WHERE id = ${activityId}`;
        console.log('Cleaned up test activity');
      }
      if (pmId) {
        await sql`DELETE FROM penerima_manfaat WHERE id = ${pmId}`;
        console.log('Cleaned up test penerima_manfaat');
      }
      if (pemesanId) {
        await sql`DELETE FROM pemesan WHERE id = ${pemesanId}`;
        console.log('Cleaned up test pemesan');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testCompleteFlow();
}

module.exports = { testCompleteFlow };
