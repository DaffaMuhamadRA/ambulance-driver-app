// Check the ambulan_activity table structure
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityTable() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== ambulan_activity table ===');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' 
      ORDER BY ordinal_position
    `;
    
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    const data = await sql`SELECT * FROM ambulan_activity LIMIT 1`;
    console.log('\nSample data:');
    console.log(data);
    
  } catch (error) {
    console.error('Error checking activity table:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkActivityTable();
}

module.exports = { checkActivityTable };
