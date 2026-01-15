const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

async function testAuth() {
  try {
    console.log('Testing authentication with valid credentials...');
    const sql = neon(connectionString);
    
    // Test fetching user directly from database
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE (name = ${'Super Admin'} OR email = ${'Super Admin'}) AND status = ${'Active'}
    `;
    
    console.log('Database query result:', result);
    
    if (result.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    const user = result[0];
    console.log('User found:', user);
    
    // Test password validation
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      isValidPassword = await bcrypt.compare('123456', user.password);
    } else {
      // It's plain text (not recommended for production)
      isValidPassword = '123456' === user.password;
    }
    
    if (isValidPassword) {
      console.log('✅ Password validation successful!');
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.id_cms_privileges == 1 ? "admin" : "driver",
        status: user.status,
        photo: user.photo,
      };
      console.log('User data:', userData);
    } else {
      console.log('❌ Password validation failed');
    }
    
    // Test with email
    console.log('\nTesting authentication with email...');
    const resultByEmail = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE (name = ${'admin@crudbooster.com'} OR email = ${'admin@crudbooster.com'}) AND status = ${'Active'}
    `;
    
    console.log('Database query result with email:', resultByEmail);
    
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAuth();
