const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkCmsUsersTable() {
  try {
    const sql = neon(connectionString);
    
    // Check columns in cms_users table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cms_users' 
      ORDER BY ordinal_position
    `;
    
    console.log('cms_users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCmsUsersTable();