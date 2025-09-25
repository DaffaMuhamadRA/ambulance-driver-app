const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkUsers() {
  try {
    const sql = neon(connectionString);
    
    // Check all users
    console.log('=== All Users ===');
    const users = await sql`
      SELECT id, name, email, id_cms_privileges, status 
      FROM cms_users 
      ORDER BY id
    `;
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.id_cms_privileges}, Status: ${user.status}`);
    });
    
    // Check active users
    console.log('\n=== Active Users ===');
    const activeUsers = await sql`
      SELECT id, name, email, id_cms_privileges, status 
      FROM cms_users 
      WHERE status = 'Active'
      ORDER BY id
    `;
    
    console.log(`Found ${activeUsers.length} active users:`);
    activeUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.id_cms_privileges}, Status: ${user.status}`);
    });
    
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

checkUsers();