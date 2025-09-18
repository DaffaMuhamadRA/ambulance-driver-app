const { neon } = require('@neondatabase/serverless');

// Database configuration - using environment variables directly
// This approach is compatible with Edge Runtime
const PGHOST = process.env.PGHOST || 'ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_26wQetjypolP';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

// Create connection string using the provided Neon PostgreSQL parameters
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;

// Create and export the SQL client
const sql = neon(connectionString);

async function createDocumentationTable() {
  try {
    // Create the dokumentasi_activity table
    await sql`
      CREATE TABLE IF NOT EXISTS dokumentasi_activity (
        id SERIAL PRIMARY KEY,
        id_activity INTEGER NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (id_activity) REFERENCES ambulan_activity(id) ON DELETE CASCADE
      )
    `;
    
    console.log('Successfully created dokumentasi_activity table');
  } catch (error) {
    console.error('Error creating dokumentasi_activity table:', error);
  }
}

createDocumentationTable();