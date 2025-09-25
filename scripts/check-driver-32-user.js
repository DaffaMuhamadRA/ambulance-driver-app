const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkDriver32User() {
  try {
    const sql = neon(connectionString);
    
    // Check driver with ID 32
    const driver = await sql`
      SELECT id, driver, username 
      FROM driver 
      WHERE id = 32
    `;
    
    console.log('Driver with ID 32:');
    console.log(driver);
    
    if (driver.length > 0) {
      // Check associated user
      const user = await sql`
        SELECT id, name, email 
        FROM cms_users 
        WHERE email = ${driver[0].username}
      `;
      
      console.log('Associated user:');
      console.log(user);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDriver32User();