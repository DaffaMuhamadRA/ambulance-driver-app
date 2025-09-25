const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./scripts/db-config');

async function checkDocumentationTable() {
  try {
    const sql = neon(connectionString);
    
    console.log('Checking dokumentasi_activity table structure...');
    
    // Get all column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'dokumentasi_activity'
      ORDER BY ordinal_position
    `;

    console.log('\nColumns in dokumentasi_activity table:');
    columns.forEach(column => {
      console.log(`  - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${column.column_default ? 'DEFAULT: ' + column.column_default : ''}`);
    });

    // Check constraints
    const constraints = await sql`
      SELECT constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'dokumentasi_activity'
    `;
    console.log('\nConstraints on dokumentasi_activity table:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type})`);
    });

    // Check for any triggers
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'dokumentasi_activity'
    `;
    console.log('\nTriggers on dokumentasi_activity table:');
    if (triggers.length === 0) {
      console.log('  - No triggers found');
    } else {
      triggers.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name} (${trigger.event_manipulation})`);
      });
    }

    // Check if there are any records
    const count = await sql`
      SELECT COUNT(*) as count FROM dokumentasi_activity
    `;

    console.log(`\nTotal records in dokumentasi_activity table: ${count[0].count}`);
    
    // Show sample data if any exist
    if (count[0].count > 0) {
      console.log('\nSample records:');
      const sample = await sql`
        SELECT * FROM dokumentasi_activity LIMIT 3
      `;
      console.log(JSON.stringify(sample, null, 2));
    }

    return columns;
  } catch (error) {
    console.error('Error checking dokumentasi_activity table:', error.message);
    return [];
  }
}

async function checkActivityTable() {
  try {
    const sql = neon(connectionString);
    
    console.log('\nChecking ambulan_activity table for tgl_pulang column...');
    
    // Check if tgl_pulang column exists
    const result = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'ambulan_activity' AND column_name = 'tgl_pulang'
    `;
    
    if (result.length > 0) {
      console.log('Column tgl_pulang exists in ambulan_activity table');
    } else {
      console.log('Column tgl_pulang does not exist in ambulan_activity table');
    }
    
    // Get the tgl_pulang value for a sample activity
    const sampleActivity = await sql`
      SELECT id, tgl_pulang FROM ambulan_activity LIMIT 1
    `;
    
    if (sampleActivity.length > 0) {
      console.log('\nSample activity with tgl_pulang:');
      console.log(JSON.stringify(sampleActivity[0], null, 2));
    }
  } catch (error) {
    console.error('Error checking ambulan_activity table:', error.message);
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkDocumentationTable().then(() => {
    checkActivityTable();
  });
}

module.exports = { checkDocumentationTable, checkActivityTable };