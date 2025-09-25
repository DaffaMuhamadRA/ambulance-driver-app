require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testDelete() {
  try {
    console.log('Testing deletion of activity ID 6 with proper constraint handling...');
    
    // First check if activity exists
    const checkResult = await sql`SELECT id FROM ambulan_activity WHERE id = 6`;
    console.log('Activity 6 exists:', checkResult.length > 0);
    
    if (checkResult.length === 0) {
      console.log('Activity 6 does not exist, nothing to delete');
      process.exit(0);
    }
    
    // First delete documentation
    console.log('Deleting documentation for activity 6...');
    const docDeleteResult = await sql`DELETE FROM dokumentasi_activity WHERE id_activity = 6`;
    console.log('Documentation deleted:', docDeleteResult);
    
    // Then delete the activity
    console.log('Deleting activity 6...');
    const activityDeleteResult = await sql`DELETE FROM ambulan_activity WHERE id = 6`;
    console.log('Activity deleted:', activityDeleteResult);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
  
  process.exit(0);
}

testDelete();