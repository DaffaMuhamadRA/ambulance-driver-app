const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkForeignKeys() {
  try {
    const sql = neon(connectionString);
    
    // Check foreign key constraints for dokumentasi_activity table
    const fkConstraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'dokumentasi_activity'
    `;
    
    console.log('Foreign key constraints for dokumentasi_activity table:');
    if (fkConstraints.length > 0) {
      fkConstraints.forEach(fk => {
        console.log(`  - ${fk.column_name} references ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('  No foreign key constraints found');
    }
    
  } catch (error) {
    console.error('Error checking foreign keys:', error.message);
  }
}

checkForeignKeys();
