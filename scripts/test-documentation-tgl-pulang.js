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

async function testDocumentationTglPulang() {
  try {
    // Test if the column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dokumentasi_activity' 
      AND column_name = 'tgl_pulang'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✓ tgl_pulang column exists in dokumentasi_activity table');
      
      // Check if there are any existing activities we can use for testing
      const activityCheck = await sql`
        SELECT id FROM ambulan_activity LIMIT 1
      `;
      
      if (activityCheck.length > 0) {
        const testActivityId = activityCheck[0].id;
        console.log(`✓ Found test activity with ID: ${testActivityId}`);
        
        // Test inserting a record with tgl_pulang
        const testInsert = await sql`
          INSERT INTO dokumentasi_activity (id_activity, url, tgl_pulang)
          VALUES (${testActivityId}, 'https://example.com/test.jpg', '2023-12-01')
          RETURNING id, id_activity, url, tgl_pulang, created_at
        `;
        
        console.log('✓ Successfully inserted record with tgl_pulang:', testInsert[0]);
        
        // Test selecting the record
        const testSelect = await sql`
          SELECT id, id_activity, url, tgl_pulang, created_at
          FROM dokumentasi_activity
          WHERE id = ${testInsert[0].id}
        `;
        
        console.log('✓ Successfully selected record with tgl_pulang:', testSelect[0]);
        
        // Clean up test record
        await sql`
          DELETE FROM dokumentasi_activity
          WHERE id = ${testInsert[0].id}
        `;
        
        console.log('✓ Cleaned up test record');
      } else {
        console.log('No existing activities found for testing');
      }
    } else {
      console.log('✗ tgl_pulang column does not exist in dokumentasi_activity table');
    }
  } catch (error) {
    console.error('Error testing documentation tgl_pulang:', error);
  }
}

testDocumentationTglPulang();
