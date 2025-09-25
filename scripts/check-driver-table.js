const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDriverTable() {
  try {
    const sql = neon(connectionString);
    
    // Check if driver table exists
    const exists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'driver'
      )
    `;
    
    console.log('driver table exists:', exists[0].exists);
    
    if (exists[0].exists) {
      // Check columns in driver table
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'driver' 
        ORDER BY ordinal_position
      `;
      
      console.log('driver table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDriverTable();