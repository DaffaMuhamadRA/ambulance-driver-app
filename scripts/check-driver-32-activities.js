const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDriver32Activities() {
  try {
    const sql = neon(connectionString);
    
    // Check activities for driver ID 32
    const activities = await sql`
      SELECT id, id_driver 
      FROM ambulan_activity 
      WHERE id_driver = 32
    `;
    
    console.log('Activities for driver ID 32:');
    console.log(activities);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDriver32Activities();