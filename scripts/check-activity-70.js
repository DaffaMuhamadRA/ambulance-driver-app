const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivity70() {
  try {
    const sql = neon(connectionString);
    const result = await sql`
      SELECT * FROM ambulan_activity WHERE id = 70
    `;
    
    if (result.length > 0) {
      console.log('Activity 70 data:');
      console.log(JSON.stringify(result[0], null, 2));
    } else {
      console.log('No activity found with ID 70');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivity70();