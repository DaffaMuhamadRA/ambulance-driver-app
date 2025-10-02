// Test script to simulate Vercel authentication environment
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

// Simulate Vercel environment
console.log('Testing authentication in Vercel-like environment...');

// Use the same database configuration as Vercel
const PGHOST = 'ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = 'neondb';
const PGUSER = 'neondb_owner';
const PGPASSWORD = 'npg_vGgHE25STeCr';
const PGSSLMODE = 'require';
const PGCHANNELBINDING = 'require';

const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;
const sql = neon(connectionString);

async function testVercelAuth() {
  try {
    console.log('Testing Vercel-like authentication...');
    
    // Test credentials (same as used in the application)
    const testEmail = 'admin@crudbooster.com';
    const testPassword = '123456';
    
    console.log(`Attempting to authenticate user: ${testEmail}`);
    
    // Simulate the exact authentication process from auth.ts
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE email = ${testEmail} AND status = 'Active'
    `;
    
    console.log('Database query result:', result.length > 0 ? 'User found' : 'User not found');
    
    if (result.length === 0) {
      console.log('❌ Authentication failed: User not found');
      return;
    }
    
    const user = result[0];
    console.log('User data from database:', {
      id: user.id,
      name: user.name,
      email: user.email,
      id_cms_privileges: user.id_cms_privileges,
      status: user.status
    });
    
    // Check password validation (same logic as auth.ts)
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      console.log('Password is bcrypt hash');
      isValidPassword = await bcrypt.compare(testPassword, user.password);
    } else {
      console.log('Password is plain text');
      isValidPassword = testPassword === user.password;
    }
    
    console.log('Password validation result:', isValidPassword ? 'Valid' : 'Invalid');
    
    if (!isValidPassword) {
      console.log('❌ Authentication failed: Invalid password');
      return;
    }
    
    console.log('✅ Authentication successful!');
    
    // Test driver ID lookup for driver users
    if (user.id_cms_privileges == 2) {
      console.log('User is a driver, checking driver ID...');
      const driverResult = await sql`
        SELECT id 
        FROM driver 
        WHERE username = ${user.email}
      `;
      
      if (driverResult.length > 0) {
        console.log('Driver ID found:', driverResult[0].id);
      } else {
        console.log('No driver ID found for this user');
      }
    } else {
      console.log('User is an admin, no driver ID needed');
    }
    
    console.log('\n🎉 Vercel-like authentication test successful!');
    
  } catch (error) {
    console.error('❌ Vercel-like authentication test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testVercelAuth();