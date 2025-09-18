// Test creating a new pemesan
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testCreatePemesan() {
  try {
    const sql = neon(connectionString);
    
    // Test creating a new pemesan
    console.log('=== Creating new pemesan ===');
    const result = await sql`
      INSERT INTO pemesan (nama_pemesan, hp)
      VALUES ('Test Pemesan', '08123456789')
      RETURNING id, nama_pemesan, hp
    `;
    
    console.log('Created pemesan:', result[0]);
    
    // Clean up - delete the test pemesan
    await sql`
      DELETE FROM pemesan WHERE id = ${result[0].id}
    `;
    
    console.log('Cleaned up test pemesan');
    
  } catch (error) {
    console.error('Error testing pemesan creation:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testCreatePemesan();
}

module.exports = { testCreatePemesan };
