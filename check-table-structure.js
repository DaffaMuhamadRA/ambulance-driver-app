const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./scripts/db-config');

async function checkTableStructure() {
  try {
    const sql = neon(connectionString);
    
    // Check the structure of dokumentasi_activity table
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dokumentasi_activity'
      ORDER BY ordinal_position
    `;
    
    console.log('dokumentasi_activity table structure:');
    console.table(result);
    
  } catch (error) {
    console.error('Error checking table structure:', error.message);
  }
}

checkTableStructure();