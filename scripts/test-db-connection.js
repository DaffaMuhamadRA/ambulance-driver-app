// Test database connection
const { neon } = require('@neondatabase/serverless');

// Use the same configuration as in db.ts
const PGHOST = process.env.PGHOST || 'ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_26wQetjypolP';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

// Create connection string using the provided Neon PostgreSQL parameters
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;

console.log('Testing database connection with:');
console.log(`Host: ${PGHOST}`);
console.log(`Database: ${PGDATABASE}`);
console.log(`User: ${PGUSER}`);
console.log(`SSL Mode: ${PGSSLMODE}`);
console.log(`Channel Binding: ${PGCHANNELBINDING}`);

async function testConnection() {
  try {
    console.log('\nAttempting to connect...');
    const sql = neon(connectionString);
    
    // Simple query to test connection
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('Database version:', result[0].version);
  } catch (error) {
    console.log('❌ Connection failed!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testConnection();