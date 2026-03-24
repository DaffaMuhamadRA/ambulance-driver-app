const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkSessionsTable() {
  try {
    const sql = neon(connectionString);
    
    // Check if sessions table exists
    const exists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sessions'
      )
    `;
    
    console.log('sessions table exists:', exists[0].exists);
    
    if (exists[0].exists) {
      // Check columns in sessions table
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'sessions' 
        ORDER BY ordinal_position
      `;
      
      console.log('sessions table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      // Check data in sessions table
      const data = await sql`
        SELECT * FROM sessions LIMIT 5
      `;
      
      console.log('sessions table data:');
      console.log(data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSessionsTable();
