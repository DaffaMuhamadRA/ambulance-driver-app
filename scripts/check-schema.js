// Check database schema and tables
// Following Neon's documentation for schema validation

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Create a client using Neon's serverless driver
    const sql = neon(connectionString);
    
    // Check if required tables exist
    const requiredTables = ['cms_users', 'ambulan', 'ambulan_activity', 'event_activity', 'sessions'];
    
    console.log('\nChecking required tables:');
    for (const tableName of requiredTables) {
      try {
        const result = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = ${tableName}
          )
        `;
        
        if (result[0].exists) {
          console.log(`  ✅ ${tableName} table exists`);
          
          // Get column information for the table
          const columns = await sql`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = ${tableName}
            ORDER BY ordinal_position
          `;
          
          console.log(`     Columns (${columns.length}):`);
          columns.forEach(column => {
            console.log(`       - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
          });
        } else {
          console.log(`  ❌ ${tableName} table does not exist`);
        }
      } catch (error) {
        console.log(`  ❌ Error checking ${tableName} table: ${error.message}`);
      }
    }
    
    // Check all available tables
    console.log('\nAll available tables:');
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } catch (error) {
      console.log(`  Error listing tables: ${error.message}`);
    }
    
    // Check row counts for key tables
    console.log('\nChecking row counts for key tables:');
    for (const tableName of requiredTables) {
      try {
        // Use sql.query for parameterized queries with table names
        const result = await sql.query('SELECT COUNT(*) as count FROM ' + tableName, [], { fullResults: true });
        console.log(`  ${tableName}: ${result.rows[0].count} rows`);
      } catch (error) {
        console.log(`  ${tableName}: Unable to count rows (${error.message})`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    return false;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkSchema().then(success => {
    if (success) {
      console.log('\n🎉 Schema check completed successfully!');
    } else {
      console.log('\n💥 Schema check failed.');
      process.exit(1);
    }
  });
}

module.exports = { checkSchema };