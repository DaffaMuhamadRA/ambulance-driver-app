// Check detail_antar table structure
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDetailAntar() {
  try {
    console.log('Checking detail_antar table structure...');
    
    // Create a client using Neon's serverless driver
    const sql = neon(connectionString);
    
    // Get column information for detail_antar table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'detail_antar'
      ORDER BY ordinal_position
    `;
    
    console.log('\ndetail_antar table columns:');
    columns.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get some sample data
    console.log('\nSample data from detail_antar:');
    const sampleData = await sql`
      SELECT * FROM detail_antar LIMIT 5
    `;
    
    console.log(sampleData);
    
    return true;
  } catch (error) {
    console.error('❌ Error checking detail_antar table:', error.message);
    return false;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkDetailAntar().then(success => {
    if (success) {
      console.log('\n🎉 detail_antar check completed successfully!');
    } else {
      console.log('\n💥 detail_antar check failed.');
      process.exit(1);
    }
  });
}

module.exports = { checkDetailAntar };
