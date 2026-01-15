const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Create and export the SQL client
const sql = neon(connectionString);

async function createDocumentationTable() {
  try {
    // Create the dokumentasi_activity table
    await sql`
      CREATE TABLE IF NOT EXISTS dokumentasi_activity (
        id SERIAL PRIMARY KEY,
        id_activity INTEGER,
        url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('Successfully created/updated dokumentasi_activity table');
  } catch (error) {
    console.error('Error creating dokumentasi_activity table:', error);
  }
}

createDocumentationTable();
