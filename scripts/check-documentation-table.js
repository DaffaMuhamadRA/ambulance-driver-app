// Check the actual structure of the dokumentasi_activity table in the database
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Create and export the SQL client
const sql = neon(connectionString);

async function checkDocumentationTable() {
  try {
    console.log('Checking dokumentasi_activity table structure...');
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dokumentasi_activity'
      ORDER BY ordinal_position
    `;
    
    console.log('\nColumns in dokumentasi_activity table:');
    columns.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if there are any records
    const count = await sql`
      SELECT COUNT(*) as count FROM dokumentasi_activity
    `;
    
    console.log(`\nTotal records in dokumentasi_activity table: ${count[0].count}`);
    
    // Show sample data if any exist
    if (count[0].count > 0) {
      console.log('\nSample records:');
      const sample = await sql`
        SELECT * FROM dokumentasi_activity LIMIT 3
      `;
      console.log(JSON.stringify(sample, null, 2));
    }
    
    return columns;
  } catch (error) {
    console.error('Error checking dokumentasi_activity table:', error.message);
    return [];
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkDocumentationTable();
}

module.exports = { checkDocumentationTable };