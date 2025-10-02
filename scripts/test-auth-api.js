// Test script to verify authentication API works correctly
const { neon } = require('@neondatabase/serverless');

// Use the same database configuration as the application
const PGHOST = process.env.PGHOST || 'ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_vGgHE25STeCr';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;
console.log('Connection string:', connectionString);

async function testAuthAPI() {
  try {
    console.log('Testing authentication API with database connection...');
    const sql = neon(connectionString);
    
    // Test database connection
    console.log('Testing database connection...');
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('Database connection successful:', testResult);
    
    // Test fetching user with email
    console.log('\nTesting user fetch with email...');
    const userEmail = 'admin@crudbooster.com';
    const userResult = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE email = ${userEmail} AND status = 'Active'
    `;
    
    console.log('User query result:', userResult);
    
    if (userResult.length === 0) {
      console.log('❌ User not found with email:', userEmail);
      return;
    }
    
    const user = userResult[0];
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.id_cms_privileges == 1 ? "admin" : "driver",
      status: user.status
    });
    
    // Test password validation
    const bcrypt = require('bcryptjs');
    const testPassword = '123456';
    
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      isValidPassword = await bcrypt.compare(testPassword, user.password);
      console.log('Password is bcrypt hash');
    } else {
      // It's plain text
      isValidPassword = testPassword === user.password;
      console.log('Password is plain text');
    }
    
    if (isValidPassword) {
      console.log('✅ Password validation successful!');
    } else {
      console.log('❌ Password validation failed');
      console.log('Expected password:', testPassword);
      console.log('Stored password hash:', user.password);
    }
    
  } catch (error) {
    console.error('❌ Authentication API test error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testAuthAPI();