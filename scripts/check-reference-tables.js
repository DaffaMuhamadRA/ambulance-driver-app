// Check reference tables needed for the activity form
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkReferenceTables() {
  try {
    const sql = neon(connectionString);
    
    // Check kantor table
    console.log('=== kantor table ===');
    const kantorCols = await sql`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'kantor'
    `;
    console.log('Columns:', kantorCols.map(c => c.column_name).join(', '));
    
    const kantorData = await sql`SELECT * FROM kantor LIMIT 5`;
    console.log('Sample data:', kantorData);
    
    // Check ambulan table
    console.log('\n=== ambulan table ===');
    const ambulanData = await sql`SELECT id, nopol FROM ambulan LIMIT 5`;
    console.log(ambulanData);
    
    // Check detail_antar table
    console.log('\n=== detail_antar table ===');
    const detailData = await sql`SELECT id, detail_antar FROM detail_antar LIMIT 5`;
    console.log(detailData);
    
    // Check cms_users (drivers)
    console.log('\n=== cms_users (drivers) ===');
    const driverData = await sql`SELECT id, name FROM cms_users WHERE id_cms_privileges != 1 LIMIT 5`;
    console.log(driverData);
    
    // Check pemesan table
    console.log('\n=== pemesan table ===');
    const pemesanData = await sql`SELECT id, nama_pemesan, hp FROM pemesan LIMIT 5`;
    console.log(pemesanData);
    
    // Check penerima_manfaat table
    console.log('\n=== penerima_manfaat table ===');
    const pmData = await sql`SELECT id, nama_pm FROM penerima_manfaat LIMIT 5`;
    console.log(pmData);
    
    // Check asnaf table
    console.log('\n=== asnaf table ===');
    const asnafData = await sql`SELECT id, asnaf FROM asnaf`;
    console.log(asnafData);
    
  } catch (error) {
    console.error('Error checking reference tables:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkReferenceTables();
}

module.exports = { checkReferenceTables };