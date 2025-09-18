// Test session retrieval function
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Copy of the getSession function from the session API route
async function getSession(token) {
  try {
    const sql = neon(connectionString);
    const result = await sql`
      SELECT 
        s.id, s.user_id, s.session_token, s.expires_at,
        u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.session_token = ${token} AND s.expires_at > NOW() AND u.status = 'Active'
    `;

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      user_id: row.user_id,
      session_token: row.session_token,
      expires_at: new Date(row.expires_at),
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        role: row.id_cms_privileges == 1 ? "admin" : "driver",
        status: row.status,
        photo: row.photo,
      },
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

async function testSessionRetrieval() {
  try {
    console.log('Testing session retrieval function...');
    
    // Use a known session token from our previous test
    const sessionToken = '854c6004a30ca1be945d3f1a165c24f26ef7ec040d07decaf77de4fef6a5c2bf';
    
    console.log(`Retrieving session with token: ${sessionToken}`);
    
    const session = await getSession(sessionToken);
    
    if (session) {
      console.log('✅ Session retrieved successfully:');
      console.log(`  User ID: ${session.user.id}`);
      console.log(`  User Name: ${session.user.name}`);
      console.log(`  User Role: ${session.user.role}`);
    } else {
      console.log('❌ Session not found or expired');
    }
    
    return session;
  } catch (error) {
    console.error('Error in test:', error.message);
    return null;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSessionRetrieval();
}

module.exports = { testSessionRetrieval, getSession };
