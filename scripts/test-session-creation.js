const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testSessionCreation() {
  try {
    console.log('Testing session creation...');
    const sql = neon(connectionString);
    
    // Generate a secure session token
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
      
    // Set expiration to 2 days
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    
    console.log('Session token:', sessionToken);
    console.log('Expires at:', expiresAt);
    
    // Try to insert session
    await sql`
      INSERT INTO sessions (user_id, session_token, expire_at)
      VALUES (${1}, ${sessionToken}, ${expiresAt})
    `;
    
    console.log('✅ Session created successfully!');
    
    // Check if session exists
    const sessionResult = await sql`
      SELECT * FROM sessions WHERE session_token = ${sessionToken}
    `;
    
    console.log('Session data:', sessionResult[0]);
    
    // Clean up - delete the test session
    await sql`
      DELETE FROM sessions WHERE session_token = ${sessionToken}
    `;
    
    console.log('✅ Session cleanup completed!');
    
  } catch (error) {
    console.error('❌ Session creation failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSessionCreation();
