const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./scripts/db-config');

async function testInsert() {
  try {
    const sql = neon(connectionString);
    
    console.log('Testing simple insert into dokumentasi_activity table...');
    
    // Use a valid activity ID that exists in the database
    const validActivityId = 8488; // This ID exists based on our check
    
    // Test inserting a simple record
    const result = await sql`
      INSERT INTO dokumentasi_activity (id_activity, url)
      VALUES (${validActivityId}, 'https://test.com/test.png')
      RETURNING id, id_activity, url, created_at
    `;
    
    console.log('Insert successful:', result);
    
    // Clean up by deleting the test record
    if (result && result[0] && result[0].id) {
      await sql`
        DELETE FROM dokumentasi_activity WHERE id = ${result[0].id}
      `;
      console.log('Test record cleaned up');
    }
    
  } catch (error) {
    console.error('Insert test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
  }
}

testInsert();