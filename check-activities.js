const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./scripts/db-config');

async function checkActivities() {
  try {
    const sql = neon(connectionString);
    
    console.log('Checking existing activities in ambulan_activity table...');
    
    // Get a few sample activities
    const result = await sql`
      SELECT id, tgl FROM ambulan_activity ORDER BY id DESC LIMIT 5
    `;
    
    console.log('Sample activities:');
    result.forEach(activity => {
      console.log(`  - ID: ${activity.id}, Date: ${activity.tgl}`);
    });
    
  } catch (error) {
    console.error('Error checking activities:', error);
  }
}

checkActivities();
