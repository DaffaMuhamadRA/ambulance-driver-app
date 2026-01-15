// Test script to verify the complete authentication flow
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Use the same database configuration as the application
const PGHOST = process.env.PGHOST || 'ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_vGgHE25STeCr';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;
const sql = neon(connectionString);

// Generate a secure session token (same as in auth.ts)
function generateSessionToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a new session (same as in auth.ts)
async function createSession(userId) {
  const sessionToken = generateSessionToken();
  // Set expiration to 2 days instead of 7 days
  const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

  try {
    await sql`
      INSERT INTO sessions (user_id, session_token, expire_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `;

    return sessionToken;
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

// Authenticate user (same as in auth.ts)
async function authenticateUser(identifier, password) {
  try {
    // For this implementation, we'll use email as the identifier
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE email = ${identifier} AND status = 'Active'
    `;

    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    // Check if the stored password is already hashed or plain text
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // It's plain text (not recommended for production)
      isValidPassword = password === user.password;
    }

    if (!isValidPassword) {
      return null;
    }

    // For driver users, get their driver ID
    let id_driver = undefined;
    if (user.id_cms_privileges == 2) {
      // This is a driver user, get their driver ID
      const driverResult = await sql`
        SELECT id 
        FROM driver 
        WHERE username = ${user.email}
      `;
      
      if (driverResult.length > 0) {
        id_driver = driverResult[0].id;
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.id_cms_privileges == 1 ? "admin" : "driver",
      status: user.status,
      photo: user.photo,
      id_driver: id_driver, // Only set for drivers
    };
  } catch (error) {
    console.error("Database error during authentication:", error);
    throw new Error("Database connection failed during authentication");
  }
}

async function testCompleteAuthFlow() {
  try {
    console.log('Testing complete authentication flow...');
    
    // Test credentials
    const testEmail = 'admin@crudbooster.com';
    const testPassword = '123456';
    
    console.log(`Attempting to authenticate user: ${testEmail}`);
    
    // Step 1: Authenticate user
    const user = await authenticateUser(testEmail, testPassword);
    
    if (!user) {
      console.log('❌ Authentication failed');
      return;
    }
    
    console.log('✅ Authentication successful');
    console.log('User data:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    
    // Step 2: Create session
    console.log('\nCreating session...');
    const sessionToken = await createSession(user.id);
    console.log('✅ Session created successfully');
    console.log('Session token:', sessionToken);
    
    // Step 3: Verify session was stored in database
    console.log('\nVerifying session in database...');
    const sessionResult = await sql`
      SELECT id, user_id, session_token, expire_at
      FROM sessions 
      WHERE session_token = ${sessionToken}
    `;
    
    if (sessionResult.length === 0) {
      console.log('❌ Session not found in database');
      return;
    }
    
    const session = sessionResult[0];
    console.log('✅ Session found in database');
    console.log('Session data:', {
      id: session.id,
      user_id: session.user_id,
      session_token: session.session_token,
      expire_at: session.expire_at
    });
    
    console.log('\n🎉 Complete authentication flow test successful!');
    
  } catch (error) {
    console.error('❌ Complete authentication flow test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testCompleteAuthFlow();
