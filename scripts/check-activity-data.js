// Check the ambulan_activity table data for issues
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityData() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Checking ambulan_activity data ===');
    
    // Check the structure of usia_pm and id_asnaf columns
    console.log('\n--- Column info ---');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' 
        AND column_name IN ('usia_pm', 'id_asnaf')
      ORDER BY column_name
    `;
    console.log(columns);
    
    // Check a few records to see the actual data
    console.log('\n--- Sample records ---');
    const sampleData = await sql`
      SELECT id, usia_pm, id_asnaf 
      FROM ambulan_activity 
      LIMIT 10
    `;
    console.log(sampleData);
    
    // Try a different approach - check if the values are actually strings
    console.log('\n--- Checking data types in practice ---');
    const dataTypeCheck = await sql`
      SELECT 
        id,
        usia_pm,
        id_asnaf,
        pg_typeof(usia_pm) as usia_pm_type,
        pg_typeof(id_asnaf) as id_asnaf_type
      FROM ambulan_activity 
      LIMIT 3
    `;
    console.log(dataTypeCheck);
    
  } catch (error) {
    console.error('Error checking activity data:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  checkActivityData();
}

module.exports = { checkActivityData };
