const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Create and export the SQL client
const sql = neon(connectionString);

async function checkColumns() {
  try {
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'dokumentasi_activity' 
      ORDER BY ordinal_position
    `;
    console.log('Columns in dokumentasi_activity table:');
    result.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    // Check if tgl_pulang column exists
    const tglPulangExists = result.find(col => col.column_name === 'tgl_pulang');
    console.log(`\ntgl_pulang column exists: ${!!tglPulangExists}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkColumns();