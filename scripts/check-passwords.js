// Check passwords for all users

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

async function checkPasswords() {
  try {
    console.log('Checking passwords for all users...\n');
    
    const sql = neon(connectionString);
    
    const users = await sql`
      SELECT id, name, email, password, id_cms_privileges, status
      FROM cms_users
      ORDER BY id
    `;
    
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Privilege ID: ${user.id_cms_privileges} (${user.id_cms_privileges == 1 ? 'Admin' : 'Driver'})`);
      console.log(`  Status: ${user.status}`);
      
      // Check if password is bcrypt hash
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
        console.log(`  Password: ${user.password} (bcrypt hash)`);
        
        // Try common passwords
        const commonPasswords = ['password', 'admin123', '123456', 'admin', 'superadmin'];
        let found = false;
        
        for (const pass of commonPasswords) {
          const isValid = await bcrypt.compare(pass, user.password);
          if (isValid) {
            console.log(`  ✅ Password matches: ${pass}`);
            found = true;
            break;
          }
        }
        
        if (!found) {
          console.log(`  ❌ Password does not match common passwords`);
        }
      } else {
        console.log(`  Password: ${user.password} (plain text)`);
        console.log(`  ✅ Plain text password: ${user.password}`);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error checking passwords:', error.message);
    return [];
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkPasswords();
}

module.exports = { checkPasswords };
