const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

// Mock NextRequest class
class MockNextRequest {
  constructor(body) {
    this.body = body;
  }
  
  async json() {
    return this.body;
  }
}

// Import the login function logic
async function testLoginAPI() {
  try {
    console.log('Testing login API endpoint...');
    
    // Simulate the login request
    const mockRequest = new MockNextRequest({
      username: 'Super Admin',
      password: '123456'
    });
    
    // Replicate the login logic from route.ts
    const { username, password } = await mockRequest.json();
    
    console.log('Input validation...');
    // Validate input (simplified)
    const sanitizedUsername = username ? username.toString().trim() : null;
    const sanitizedPassword = password ? password.toString().trim() : null;
    
    if (!sanitizedUsername || !sanitizedPassword) {
      console.log('❌ Validation failed: Username and password must be filled');
      return;
    }
    
    console.log('Authenticating user...');
    // Authenticate user
    const sql = neon(connectionString);
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE (name = ${sanitizedUsername} OR email = ${sanitizedUsername}) AND status = 'Active'
    `;
    
    if (result.length === 0) {
      console.log('❌ Authentication failed: User not found');
      return;
    }
    
    const user = result[0];
    
    // Check password
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      isValidPassword = await bcrypt.compare(sanitizedPassword, user.password);
    } else {
      // It's plain text
      isValidPassword = sanitizedPassword === user.password;
    }
    
    if (!isValidPassword) {
      console.log('❌ Authentication failed: Invalid password');
      return;
    }
    
    console.log('✅ Authentication successful!');
    console.log('User:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.id_cms_privileges == 1 ? "admin" : "driver",
      status: user.status,
      photo: user.photo,
    });
    
    console.log('Creating session...');
    // Create session (simplified)
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
      
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    
    console.log('✅ Session created successfully!');
    console.log('Session token:', sessionToken);
    
    console.log('✅ Login API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Login API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testLoginAPI();