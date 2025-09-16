// Create sessions table script

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function createSessionsTable() {
  try {
    console.log('Creating sessions table...');
    
    const sql = neon(connectionString);
    
    // Create the sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES cms_users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    console.log('✅ Sessions table created successfully!');
    
    // Verify the table was created
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sessions'
      )
    `;
    
    if (result[0].exists) {
      console.log('✅ Verified: sessions table exists');
      
      // Get column information for the table
      const columns = await sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'sessions'
        ORDER BY ordinal_position
      `;
      
      console.log('Sessions table columns:');
      columns.forEach(column => {
        console.log(`  - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ Error: sessions table was not created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creating sessions table:', error.message);
    return false;
  }
}

// Run the creation if this file is executed directly
if (require.main === module) {
  createSessionsTable().then(success => {
    if (success) {
      console.log('\n🎉 Sessions table setup completed successfully!');
    } else {
      console.log('\n💥 Sessions table setup failed.');
      process.exit(1);
    }
  });
}

module.exports = { createSessionsTable };