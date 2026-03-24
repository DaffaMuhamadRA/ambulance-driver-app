const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityDriverColumns() {
  try {
    const sql = neon(connectionString);
    
    // Check driver-related columns in ambulan_activity table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' 
        AND column_name LIKE '%driver%'
      ORDER BY ordinal_position
    `;
    
    console.log('Driver-related columns in ambulan_activity:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivityDriverColumns();
