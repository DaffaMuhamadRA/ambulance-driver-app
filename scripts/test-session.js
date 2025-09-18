// Test session retrieval
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testSessionRetrieval() {
  try {
    console.log('Testing session retrieval from database...');
    
    const sql = neon(connectionString);
    
    // Get all sessions
    const sessions = await sql`
      SELECT 
        s.id, s.user_id, s.session_token, s.expires_at,
        u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.expires_at > NOW() AND u.status = 'Active'
    `;
    
    console.log(`Found ${sessions.length} active sessions:`);
    sessions.forEach(session => {
      console.log(`  - Session ID: ${session.id}`);
      console.log(`    User ID: ${session.user_id}`);
      console.log(`    User Name: ${session.name}`);
      console.log(`    Session Token: ${session.session_token}`);
      console.log(`    Expires At: ${session.expires_at}`);
      console.log('');
    });
    
    return sessions;
  } catch (error) {
    console.error('Error retrieving sessions:', error.message);
    return [];
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSessionRetrieval();
}

module.exports = { testSessionRetrieval };
