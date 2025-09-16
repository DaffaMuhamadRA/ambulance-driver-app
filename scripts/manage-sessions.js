// Session management utilities
// For working with user sessions in Neon database

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function listSessions() {
  try {
    console.log('Listing active sessions...');
    
    const sql = neon(connectionString);
    
    const sessions = await sql`
      SELECT s.id, s.user_id, s.session_token, s.expires_at, s.created_at,
             u.name, u.email
      FROM sessions s
      JOIN cms_users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `;
    
    console.log(`Found ${sessions.length} active sessions:`);
    sessions.forEach(session => {
      console.log(`  - Session ${session.id}: User ${session.name} (${session.email})`);
      console.log(`    Token: ${session.session_token.substring(0, 10)}...`);
      console.log(`    Expires: ${session.expires_at}`);
      console.log(`    Created: ${session.created_at}`);
    });
    
    return sessions;
  } catch (error) {
    console.error('Error listing sessions:', error.message);
    return [];
  }
}

async function cleanExpiredSessions() {
  try {
    console.log('Cleaning expired sessions...');
    
    const sql = neon(connectionString);
    
    const result = await sql`
      DELETE FROM sessions 
      WHERE expires_at < NOW()
    `;
    
    console.log(`✅ Cleaned ${result.rowCount} expired sessions`);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning expired sessions:', error.message);
    return 0;
  }
}

async function deleteSession(token) {
  try {
    console.log(`Deleting session with token: ${token.substring(0, 10)}...`);
    
    const sql = neon(connectionString);
    
    const result = await sql`
      DELETE FROM sessions 
      WHERE session_token = ${token}
    `;
    
    if (result.rowCount > 0) {
      console.log(`✅ Session deleted successfully`);
      return true;
    } else {
      console.log(`❌ No session found with that token`);
      return false;
    }
  } catch (error) {
    console.error('Error deleting session:', error.message);
    return false;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node manage-sessions.js <command> [options]');
    console.log('Commands:');
    console.log('  list              - List all active sessions');
    console.log('  clean             - Clean expired sessions');
    console.log('  delete <token>     - Delete session by token');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'list':
      listSessions();
      break;
      
    case 'clean':
      cleanExpiredSessions();
      break;
      
    case 'delete':
      if (args.length < 2) {
        console.log('Usage: node manage-sessions.js delete <token>');
        process.exit(1);
      }
      deleteSession(args[1]);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = { listSessions, cleanExpiredSessions, deleteSession };