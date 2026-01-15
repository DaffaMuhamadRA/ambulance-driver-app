// Test script to verify database connection in Vercel-like environment
const { neon } = require('@neondatabase/serverless');

// Simulate Vercel environment variables
console.log('Testing database connection with Vercel-like environment...');

// Use the same database configuration as Vercel
const PGHOST = 'ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = 'neondb';
const PGUSER = 'neondb_owner';
const PGPASSWORD = 'npg_vGgHE25STeCr';
const PGSSLMODE = 'require';
const PGCHANNELBINDING = 'require';

const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;
console.log('Connection string:', connectionString);

async function testDBConnection() {
  try {
    console.log('Testing database connection...');
    const sql = neon(connectionString);
    
    // Test database connection
    console.log('Testing database connection...');
    const testResult = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('Database connection successful:', testResult);
    
    // Test fetching users
    console.log('\nTesting user fetch...');
    const userResult = await sql`
      SELECT id, name, email, id_cms_privileges, status
      FROM cms_users 
      LIMIT 5
    `;
    
    console.log('User fetch successful. Found', userResult.length, 'users');
    userResult.forEach((user, index) => {
      console.log(`User ${index + 1}:`, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.id_cms_privileges == 1 ? "admin" : "driver",
        status: user.status
      });
    });
    
    console.log('\n🎉 Database connection test successful!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
  }
}

testDBConnection();
