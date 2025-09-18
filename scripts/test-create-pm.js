// Test creating a new penerima manfaat
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testCreatePM() {
  try {
    const sql = neon(connectionString);
    
    // Test creating a new penerima manfaat
    console.log('=== Creating new penerima manfaat ===');
    const result = await sql`
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
        'Test PM', 
        'Jl. Test', 
        'Laki-laki', 
        30, 
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
    
    console.log('Created penerima manfaat:', result[0]);
    
    // Clean up - delete the test penerima manfaat
    await sql`
      DELETE FROM penerima_manfaat WHERE id = ${result[0].id}
    `;
    
    console.log('Cleaned up test penerima manfaat');
    
  } catch (error) {
    console.error('Error testing penerima manfaat creation:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testCreatePM();
}

module.exports = { testCreatePM };
