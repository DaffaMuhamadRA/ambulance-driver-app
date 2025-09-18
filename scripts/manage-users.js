// User management utilities
// For working with existing users in Neon database

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

async function listUsers() {
  try {
    console.log('Listing users in database...');
    
    const sql = neon(connectionString);
    
    const users = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, created_at
      FROM cms_users
      ORDER BY id
    `;
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.id}: ${user.name} (${user.email}) [Privilege: ${user.id_cms_privileges}] ${user.status === 'Active' ? '(Active)' : '(Inactive)'} Created: ${user.created_at}`);
    });
    
    return users;
  } catch (error) {
    console.error('Error listing users:', error.message);
    return [];
  }
}

async function findUser(identifier) {
  try {
    console.log(`Finding user with identifier: ${identifier}`);
    
    const sql = neon(connectionString);
    
    const users = await sql`
      SELECT id, name, email, password, id_cms_privileges, status
      FROM cms_users
      WHERE name = ${identifier} OR email = ${identifier}
    `;
    
    if (users.length > 0) {
      console.log('User found:');
      const user = users[0];
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password Hash: ${user.password}`);
      console.log(`  Privilege ID: ${user.id_cms_privileges}`);
      console.log(`  Status: ${user.status}`);
      return user;
    } else {
      console.log('No user found with that identifier');
      return null;
    }
  } catch (error) {
    console.error('Error finding user:', error.message);
    return null;
  }
}

async function verifyPassword(email, password) {
  try {
    console.log(`Verifying password for user: ${email}`);
    
    const sql = neon(connectionString);
    
    const users = await sql`
      SELECT id, name, email, password, id_cms_privileges
      FROM cms_users
      WHERE email = ${email} AND status = 'Active'
    `;
    
    if (users.length === 0) {
      console.log('No active user found with that email');
      return { success: false, message: 'User not found' };
    }
    
    const user = users[0];
    console.log('User found:', user.name);
    console.log('Stored password hash:', user.password);
    console.log('Provided password:', password);
    
    // Check if the stored password is already hashed or plain text
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      const isValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result (bcrypt):', isValid);
      
      if (isValid) {
        console.log('✅ Password is correct');
        return { 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.id_cms_privileges == 1 ? 'admin' : 'driver' 
          } 
        };
      } else {
        console.log('❌ Password is incorrect');
        return { success: false, message: 'Invalid password' };
      }
    } else {
      // It's plain text (not recommended for production)
      const isValid = password === user.password;
      console.log('Password validation result (plain text):', isValid);
      
      if (isValid) {
        console.log('✅ Password is correct (plain text)');
        return { 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.id_cms_privileges == 1 ? 'admin' : 'driver' 
          } 
        };
      } else {
        console.log('❌ Password is incorrect');
        return { success: false, message: 'Invalid password' };
      }
    }
  } catch (error) {
    console.error('Error verifying password:', error.message);
    return { success: false, message: 'Verification failed' };
  }
}

async function createUser(name, email, password, privilegeId, status = 'Active') {
  try {
    console.log(`Creating user: ${name} (${email})`);
    
    const sql = neon(connectionString);
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await sql`
      INSERT INTO cms_users (name, email, password, id_cms_privileges, status, created_at, updated_at)
      VALUES (${name}, ${email}, ${passwordHash}, ${privilegeId}, ${status}, NOW(), NOW())
      RETURNING id, name, email, id_cms_privileges, status
    `;
    
    console.log('✅ User created successfully:');
    console.log(`  ID: ${result[0].id}`);
    console.log(`  Name: ${result[0].name}`);
    console.log(`  Email: ${result[0].email}`);
    console.log(`  Privilege ID: ${result[0].id_cms_privileges}`);
    console.log(`  Status: ${result[0].status}`);
    
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error.message);
    return null;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node manage-users.js <command> [options]');
    console.log('Commands:');
    console.log('  list                    - List all users');
    console.log('  find <identifier>       - Find user by name or email');
    console.log('  verify <email> <pass>   - Verify user password');
    console.log('  create <name> <email> <password> <privilege_id> [status] - Create new user');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'list':
      listUsers();
      break;
      
    case 'find':
      if (args.length < 2) {
        console.log('Usage: node manage-users.js find <identifier>');
        process.exit(1);
      }
      findUser(args[1]);
      break;
      
    case 'verify':
      if (args.length < 3) {
        console.log('Usage: node manage-users.js verify <email> <password>');
        process.exit(1);
      }
      verifyPassword(args[1], args[2]);
      break;
      
    case 'create':
      if (args.length < 5) {
        console.log('Usage: node manage-users.js create <name> <email> <password> <privilege_id> [status]');
        process.exit(1);
      }
      createUser(args[1], args[2], args[3], args[4], args[5] || 'Active');
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = { listUsers, findUser, verifyPassword, createUser };
