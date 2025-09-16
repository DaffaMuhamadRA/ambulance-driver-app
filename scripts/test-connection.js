// Test database connection using Neon Serverless Driver
// Following Neon's documentation: https://neon.com/docs/connect/connect-from-any-app

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testConnection() {
  try {
    console.log('Testing database connection to Neon PostgreSQL...');
    
    // Create a client using Neon's serverless driver
    const sql = neon(connectionString);
    
    // Test the connection with a simple query
    const result = await sql`SELECT NOW() as current_time`;
    
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result[0].current_time);
    
    // List all tables in the database
    console.log('\nListing all tables in the database...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Test querying cms_users table (correct table name)
    console.log('\nTesting cms_users table access...');
    const users = await sql`SELECT id, name, email, id_cms_privileges FROM cms_users LIMIT 3`;
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.id}: ${user.name} (${user.email}) [Privilege: ${user.id_cms_privileges}]`);
    });
    
    // Test querying ambulan table (correct table name)
    console.log('\nTesting ambulan table access...');
    const ambulances = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in ambulan table:');
    ambulances.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    // Test querying ambulan_activity table (correct table name)
    console.log('\nTesting ambulan_activity table access...');
    const activityColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in ambulan_activity table:');
    activityColumns.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    // Test querying driver table
    console.log('\nTesting driver table access...');
    const driverColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'driver'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in driver table:');
    driverColumns.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConnection().then(success => {
    if (success) {
      console.log('\n🎉 All tests passed! Database is ready to use.');
    } else {
      console.log('\n💥 Database connection test failed. Please check your configuration.');
      process.exit(1);
    }
  });
}

module.exports = { testConnection };