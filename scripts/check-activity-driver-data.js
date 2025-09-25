const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivityDriverData() {
  try {
    const sql = neon(connectionString);
    
    // Check sample activity records with id_driver
    const sample = await sql`
      SELECT id, id_driver 
      FROM ambulan_activity 
      WHERE id_driver IS NOT NULL 
      LIMIT 5
    `;
    
    console.log('Sample activity records with id_driver:');
    sample.forEach(row => {
      console.log(`  Activity ID: ${row.id}, Driver ID: ${row.id_driver}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivityDriverData();