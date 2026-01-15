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

async function addTglPulangToDocumentationTable() {
  try {
    // Add tgl_pulang column to dokumentasi_activity table
    await sql`
      ALTER TABLE dokumentasi_activity 
      ADD COLUMN IF NOT EXISTS tgl_pulang DATE
    `;
    
    console.log('Successfully added tgl_pulang column to dokumentasi_activity table');
    
    // Add a comment to explain the purpose of this column
    await sql`
      COMMENT ON COLUMN dokumentasi_activity.tgl_pulang IS 'Tanggal pulang from related ambulan_activity record'
    `;
    
    console.log('Successfully added comment to tgl_pulang column');
    
    // Create an index for better performance when querying by tgl_pulang
    await sql`
      CREATE INDEX IF NOT EXISTS idx_dokumentasi_activity_tgl_pulang ON dokumentasi_activity(tgl_pulang)
    `;
    
    console.log('Successfully created index on tgl_pulang column');
    
    // Populate existing records with tgl_pulang data from ambulan_activity
    await sql`
      UPDATE dokumentasi_activity 
      SET tgl_pulang = aa.tgl_pulang
      FROM ambulan_activity aa
      WHERE dokumentasi_activity.id_activity = aa.id
      AND dokumentasi_activity.tgl_pulang IS NULL
    `;
    
    console.log('Successfully populated tgl_pulang column for existing records');
  } catch (error) {
    console.error('Error modifying dokumentasi_activity table:', error);
  }
}

addTglPulangToDocumentationTable();
