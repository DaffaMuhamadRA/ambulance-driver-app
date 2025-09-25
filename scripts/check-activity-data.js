// Check the ambulan_activity table data for issues
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityData() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Checking ambulan_activity data ===');
    
    // Check a few records to see the actual data
    console.log('\n--- Sample records ---');
    const sampleData = await sql`
      SELECT id, id_penerima_manfaat, tgl, tgl_pulang
      FROM ambulan_activity 
      LIMIT 5
    `;
    console.log(sampleData);
    
    // Check relationship with penerima_manfaat table
    console.log('\n--- Checking relationship with penerima_manfaat ---');
    const relationshipData = await sql`
      SELECT 
        a.id as activity_id,
        a.id_penerima_manfaat,
        p.nama_pm,
        p.usia_pm,
        p.id_asnaf
      FROM ambulan_activity a
      LEFT JOIN penerima_manfaat p ON a.id_penerima_manfaat = p.id
      LIMIT 5
    `;
    console.log(relationshipData);
    
  } catch (error) {
    console.error('Error checking activity data:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkActivityData();
}

module.exports = { checkActivityData };