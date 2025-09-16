// Check the schema of the ambulan_activity table
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivitySchema() {
  try {
    console.log('Checking schema of ambulan_activity table...');
    
    const sql = neon(connectionString);
    
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ambulan_activity'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in ambulan_activity table:');
    columns.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type})`);
    });
    
    return columns;
  } catch (error) {
    console.error('Error checking activity schema:', error.message);
    return [];
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkActivitySchema();
}

module.exports = { checkActivitySchema };