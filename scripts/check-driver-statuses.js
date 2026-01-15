const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDriverStatuses() {
  try {
    const sql = neon(connectionString);
    
    // Check distinct statuses in driver table
    const statuses = await sql`SELECT DISTINCT status FROM driver`;
    console.log('Driver statuses:', statuses);
    
    // Check sample driver data
    const drivers = await sql`SELECT id, driver, status, aktif FROM driver LIMIT 10`;
    console.log('Sample drivers:', drivers);
    
  } catch (error) {
    console.error('Error checking driver statuses:', error.message);
  }
}

checkDriverStatuses();
