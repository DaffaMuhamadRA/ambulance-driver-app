// Check the reward_pengantaran table structure
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkRewardTable() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== reward_pengantaran table ===');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reward_pengantaran' 
      ORDER BY ordinal_position
    `;
    
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    const data = await sql`SELECT * FROM reward_pengantaran LIMIT 5`;
    console.log('\nSample data:');
    console.log(data);
    
  } catch (error) {
    console.error('Error checking reward table:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkRewardTable();
}

module.exports = { checkRewardTable };
