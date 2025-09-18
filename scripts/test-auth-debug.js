// Debug script for authentication issues
const { neon } = require('@neondatabase/serverless');

// Database configuration - using environment variables directly
// This approach is compatible with Edge Runtime
const PGHOST = process.env.PGHOST || 'ep-odd-sunset-a178tsrs-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_26wQetjypolP';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

// Create connection string using the provided Neon PostgreSQL parameters
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;

// Create and export the SQL client
const sql = neon(connectionString);

async function debugAuth() {
  try {
    console.log('Testing authentication process...');
    
    // Test database connection first
    const timeResult = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', timeResult[0].current_time);
    
    // Test querying cms_users table
    console.log('\nTesting cms_users table access...');
    const users = await sql`SELECT id, name, email, password, id_cms_privileges, status FROM cms_users LIMIT 3`;
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.id}: ${user.name} (${user.email}) [Privilege: ${user.id_cms_privileges}] [Status: ${user.status}]`);
      console.log(`    Password (first 20 chars): ${user.password.substring(0, 20)}...`);
    });
    
    // Test specific user authentication
    if (users.length > 0) {
      console.log('\nTesting authentication for first user...');
      const user = users[0];
      console.log(`Testing user: ${user.name} (${user.email})`);
      
      // Try to authenticate with a simple query
      const authResult = await sql`
        SELECT id, name, email, id_cms_privileges, status
        FROM cms_users 
        WHERE (name = ${user.name} OR email = ${user.email}) AND status = 'Active'
      `;
      
      console.log('Authentication query result:', authResult);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication debugging failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Run the debug test
debugAuth().then(success => {
  if (success) {
    console.log('\n🎉 Authentication debugging completed successfully.');
  } else {
    console.log('\n💥 Authentication debugging failed.');
    process.exit(1);
  }
});