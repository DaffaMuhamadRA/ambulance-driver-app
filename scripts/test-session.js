const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testSession() {
  try {
    console.log('Testing session creation and retrieval...');
    const sql = neon(connectionString);
    
    // Create a test session
    const sessionToken = 'test_session_token_' + Date.now();
    const userId = 1; // Super Admin
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    
    console.log('Creating test session...');
    await sql`
      INSERT INTO sessions (user_id, session_token, expire_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `;
    
    console.log('✅ Session created successfully');
    
    // Test retrieving the session
    console.log('Retrieving session...');
    const result = await sql`
      SELECT 
        s.id, s.user_id, s.session_token, s.expire_at,
        u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken} AND s.expire_at > NOW() AND u.status = 'Active'
    `;
    
    if (result.length > 0) {
      console.log('✅ Session retrieved successfully:');
      console.log('User:', {
        id: result[0].user_id,
        name: result[0].name,
        email: result[0].email,
        role: result[0].id_cms_privileges == 1 ? "admin" : "driver",
        status: result[0].status
      });
    } else {
      console.log('❌ Failed to retrieve session');
    }
    
    // Clean up test session
    console.log('Cleaning up test session...');
    await sql`
      DELETE FROM sessions WHERE session_token = ${sessionToken}
    `;
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSession();
