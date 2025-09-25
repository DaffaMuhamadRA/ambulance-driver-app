const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkUserDriverRelationship() {
  try {
    const sql = neon(connectionString);
    
    // Check relationship between cms_users and driver tables
    const result = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.id_cms_privileges, 
        d.id as driver_id, 
        d.driver, 
        d.username 
      FROM cms_users u 
      LEFT JOIN driver d ON u.name = d.username 
      WHERE u.status = 'Active' 
      ORDER BY u.id 
      LIMIT 10
    `;
    
    console.log('User-Driver relationship:');
    result.forEach(row => {
      console.log(`  User: ${row.name} (${row.email}) - Role: ${row.id_cms_privileges} - Driver: ${row.driver || 'N/A'} (${row.username || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUserDriverRelationship();