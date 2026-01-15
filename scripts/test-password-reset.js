const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testPasswordReset() {
  try {
    const sql = neon(connectionString);
    
    // Test user email
    const testEmail = "admin@crudbooster.com";
    
    console.log("Testing password reset for:", testEmail);
    
    // Check if user exists
    const result = await sql`
      SELECT id, name, email, token, updated_at
      FROM cms_users 
      WHERE email = ${testEmail}
    `;
    
    if (result.length === 0) {
      console.log("User not found");
      return;
    }
    
    const user = result[0];
    console.log("User found:", user);
    
    // Test the token expiration logic
    if (user.token) {
      const tokenCreatedAt = new Date(user.updated_at);
      const now = new Date();
      const diffInMinutes = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60);
      
      console.log("Token age:", diffInMinutes, "minutes");
      
      if (diffInMinutes > 60) {
        console.log("Token has expired");
      } else {
        console.log("Token is still valid");
      }
    } else {
      console.log("No token found for user");
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPasswordReset();
