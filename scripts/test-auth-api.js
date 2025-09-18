// Test authentication API

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

async function testAuth() {
  try {
    console.log('Testing authentication with Neon database...');
    
    const sql = neon(connectionString);
    
    // Test with known credentials
    const email = 'admin@example.com';
    const password = '123456';
    
    console.log(`Attempting to authenticate user: ${email}`);
    
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status
      FROM cms_users 
      WHERE email = ${email} AND status = 'Active'
    `;
    
    console.log('Database query result:', result);
    
    if (result.length === 0) {
      console.log('No user found with that email');
      return;
    }
    
    const user = result[0];
    console.log('User found:', user.name);
    console.log('Stored password hash:', user.password);
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValid);
    
    if (isValid) {
      console.log('✅ Authentication successful!');
      console.log('User details:');
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.id_cms_privileges == 1 ? 'Admin' : 'Driver'}`);
    } else {
      console.log('❌ Authentication failed!');
    }
  } catch (error) {
    console.error('Authentication error:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };
