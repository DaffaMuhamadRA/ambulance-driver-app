const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityDriverRelationship() {
  try {
    const sql = neon(connectionString);
    
    // Check relationship between ambulan_activity and driver tables
    const result = await sql`
      SELECT 
        a.id as activity_id, 
        a.id_driver, 
        d.id as driver_id, 
        d.driver 
      FROM ambulan_activity a 
      JOIN driver d ON a.id_driver = d.id 
      LIMIT 5
    `;
    
    console.log('Activity-Driver relationship:');
    result.forEach(row => {
      console.log(`  Activity ID: ${row.activity_id}, Driver ID: ${row.id_driver}, Driver Name: ${row.driver}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivityDriverRelationship();