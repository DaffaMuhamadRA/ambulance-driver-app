const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDriverUserEmail() {
  try {
    const sql = neon(connectionString);
    
    // Check relationship between driver and cms_users tables based on email
    const result = await sql`
      SELECT 
        d.id as driver_id, 
        d.driver, 
        d.username, 
        u.id as user_id, 
        u.name, 
        u.email 
      FROM driver d 
      JOIN cms_users u ON d.username = u.email 
      WHERE u.id_cms_privileges = 2 
      LIMIT 5
    `;
    
    console.log('Driver-User relationship (by email):');
    result.forEach(row => {
      console.log(`  Driver: ${row.driver} (${row.username}) - User: ${row.name} (${row.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDriverUserEmail();
