const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkActivitiesTable() {
  try {
    const sql = neon(connectionString);
    
    // Check if activities table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activities'
      )
    `;
    
    console.log('activities table exists:', result[0].exists);
    
    // Check if ambulan_activity table exists
    const result2 = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ambulan_activity'
      )
    `;
    
    console.log('ambulan_activity table exists:', result2[0].exists);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivitiesTable();
