const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./scripts/db-config');

async function removeTglPulangColumn() {
  try {
    const sql = neon(connectionString);
    
    console.log('Checking if tgl_pulang column exists in dokumentasi_activity table...');
    
    // Check if tgl_pulang column exists
    const result = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'dokumentasi_activity' AND column_name = 'tgl_pulang'
    `;
    
    if (result.length === 0) {
      console.log('Column tgl_pulang does not exist in dokumentasi_activity table');
      return;
    }
    
    console.log('Column tgl_pulang exists in dokumentasi_activity table - removing it...');
    
    // Drop the tgl_pulang column
    await sql`ALTER TABLE dokumentasi_activity DROP COLUMN tgl_pulang`;
    
    console.log('Successfully removed tgl_pulang column from dokumentasi_activity table');
    
  } catch (error) {
    console.error('Error removing tgl_pulang column:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  removeTglPulangColumn();
}

module.exports = { removeTglPulangColumn };
