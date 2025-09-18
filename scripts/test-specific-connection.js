// Test database connection with specific parameters from user query
const { neon } = require('@neondatabase/serverless');

// Database configuration using the specific values provided
const PGHOST = 'ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = 'neondb';
const PGUSER = 'neondb_owner';
const PGPASSWORD = 'npg_26wQetjypolP';
const PGSSLMODE = 'require';
const PGCHANNELBINDING = 'require';

// Create connection string using the provided Neon PostgreSQL parameters
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;

console.log('Testing connection with these parameters:');
console.log('PGHOST:', PGHOST);
console.log('PGDATABASE:', PGDATABASE);
console.log('PGUSER:', PGUSER);
console.log('PGSSLMODE:', PGSSLMODE);
console.log('PGCHANNELBINDING:', PGCHANNELBINDING);
console.log('Connection string (without password):', `postgresql://${PGUSER}:****@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`);

async function testConnection() {
  try {
    console.log('\nTesting database connection...');
    
    // Create a client using Neon's serverless driver
    const sql = neon(connectionString);
    
    // Test the connection with a simple query
    const result = await sql`SELECT NOW() as current_time`;
    
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result[0].current_time);
    
    // Test querying cms_users table
    console.log('\nTesting cms_users table access...');
    const users = await sql`SELECT id, name, email, id_cms_privileges FROM cms_users LIMIT 3`;
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.id}: ${user.name} (${user.email}) [Privilege: ${user.id_cms_privileges}]`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Connection test passed! Database is accessible with these parameters.');
  } else {
    console.log('\n💥 Connection test failed. Please check your credentials.');
    process.exit(1);
  }
});