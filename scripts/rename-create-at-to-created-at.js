const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Create and export the SQL client
const sql = neon(connectionString);

async function renameCreateAtToCreatedAt() {
  try {
    // Rename the column from create_at to created_at
    await sql`
      ALTER TABLE dokumentasi_activity 
      RENAME COLUMN create_at TO created_at
    `;
    
    console.log('Successfully renamed create_at column to created_at in dokumentasi_activity table');
  } catch (error) {
    console.error('Error renaming column:', error);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  renameCreateAtToCreatedAt();
}

module.exports = { renameCreateAtToCreatedAt };