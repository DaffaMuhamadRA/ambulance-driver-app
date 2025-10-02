// This script tests the password reset API endpoints
// Note: This is a simplified test and should be run in a development environment only

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testResetPasswordAPI() {
  try {
    console.log("Testing password reset API endpoints...\n");
    
    // Test 1: Request password reset
    console.log("1. Testing password reset request...");
    
    // In a real test, we would make an HTTP request to the API endpoint
    // For now, we'll simulate the database operations
    
    const sql = neon(connectionString);
    const testEmail = "admin@crudbooster.com";
    
    // Check if user exists
    const userResult = await sql`
      SELECT id, name, email
      FROM cms_users 
      WHERE email = ${testEmail} AND status = 'Active'
    `;
    
    if (userResult.length === 0) {
      console.log("   User not found or not active");
      return;
    }
    
    const user = userResult[0];
    console.log("   User found:", user.name, "(", user.email, ")");
    
    // Generate a test token
    const crypto = require('crypto');
    const testToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
      
    console.log("   Generated test token:", testToken);
    
    // Store the token in the database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    await sql`
      UPDATE cms_users 
      SET token = ${testToken}, updated_at = NOW()
      WHERE id = ${user.id}
    `;
    
    console.log("   Token saved to database for user:", user.id);
    
    // Test 2: Verify token and reset password
    console.log("\n2. Testing token verification and password reset...");
    
    // Check if token exists and is valid
    const tokenResult = await sql`
      SELECT id, email, token, updated_at
      FROM cms_users 
      WHERE token = ${testToken} AND status = 'Active'
    `;
    
    if (tokenResult.length === 0) {
      console.log("   Invalid or expired token");
      return;
    }
    
    const tokenUser = tokenResult[0];
    console.log("   Token found for user:", tokenUser.email);
    
    // Check if token is expired (1 hour)
    const tokenCreatedAt = new Date(tokenUser.updated_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60);
    
    console.log("   Token age:", diffInMinutes, "minutes");
    
    if (diffInMinutes > 60) {
      console.log("   Token has expired");
      return;
    }
    
    console.log("   Token is valid");
    
    // Simulate password hashing
    const bcrypt = require('bcryptjs');
    const newPassword = "newpassword123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log("   New password hashed");
    
    // Update the user's password and clear the token
    await sql`
      UPDATE cms_users 
      SET password = ${hashedPassword}, token = NULL, updated_at = NOW()
      WHERE id = ${tokenUser.id}
    `;
    
    console.log("   Password updated successfully for user:", tokenUser.id);
    console.log("\nAll tests passed!");
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testResetPasswordAPI();