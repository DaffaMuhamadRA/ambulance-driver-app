// Check the penerima_manfaat table structure
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkPMTable() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== penerima_manfaat table ===');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'penerima_manfaat' 
      ORDER BY ordinal_position
    `;
    
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get sample data
    const data = await sql`SELECT * FROM penerima_manfaat LIMIT 3`;
    console.log('\nSample data:');
    console.log(data);
    
  } catch (error) {
    console.error('Error checking penerima_manfaat table:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkPMTable();
}

module.exports = { checkPMTable };