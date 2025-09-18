// Check relationship between ambulan_activity and detail_antar tables
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityRelationship() {
  try {
    console.log('Checking relationship between ambulan_activity and detail_antar tables...');
    
    // Create a client using Neon's serverless driver
    const sql = neon(connectionString);
    
    // Check if id_detail column exists in ambulan_activity
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' AND column_name = 'id_detail'
    `;
    
    if (columns.length > 0) {
      console.log('\nFound id_detail column in ambulan_activity:');
      console.log(`  - ${columns[0].column_name} (${columns[0].data_type}) ${columns[0].is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      
      // Get some sample data with the relationship
      console.log('\nSample data showing relationship:');
      const sampleData = await sql`
        SELECT 
          a.id, 
          a.tgl, 
          a.dari, 
          a.tujuan, 
          da.detail_antar as detail,
          a.jam_berangkat, 
          a.jam_pulang
        FROM ambulan_activity a
        JOIN detail_antar da ON a.id_detail = da.id
        LIMIT 5
      `;
      
      console.log(sampleData);
    } else {
      console.log('\nNo id_detail column found in ambulan_activity table');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking table relationship:', error.message);
    return false;
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkActivityRelationship().then(success => {
    if (success) {
      console.log('\n🎉 Relationship check completed successfully!');
    } else {
      console.log('\n💥 Relationship check failed.');
      process.exit(1);
    }
  });
}

module.exports = { checkActivityRelationship };
