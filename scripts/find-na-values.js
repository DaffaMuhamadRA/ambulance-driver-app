// Find records with "N/A" values that might cause casting issues
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function findNaValues() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Checking for problematic "N/A" values ===');
    
    // Check for "N/A" in usia_pm column
    console.log('\n--- Checking usia_pm column ---');
    const usiaResults = await sql`
      SELECT id, usia_pm 
      FROM ambulan_activity 
      WHERE usia_pm = 'N/A' 
      LIMIT 5
    `;
    console.log('Records with usia_pm = "N/A":', usiaResults.length);
    console.log(usiaResults);
    
    // Check for "N/A" in id_asnaf column
    console.log('\n--- Checking id_asnaf column ---');
    const asnafResults = await sql`
      SELECT id, id_asnaf 
      FROM ambulan_activity 
      WHERE id_asnaf::text = 'N/A' 
      LIMIT 5
    `;
    console.log('Records with id_asnaf = "N/A":', asnafResults.length);
    console.log(asnafResults);
    
    // Check for other potential problematic values
    console.log('\n--- Checking for non-numeric usia_pm values ---');
    const nonNumericUsia = await sql`
      SELECT id, usia_pm 
      FROM ambulan_activity 
      WHERE usia_pm !~ '^[0-9]+$' AND usia_pm IS NOT NULL
      LIMIT 5
    `;
    console.log('Records with non-numeric usia_pm:', nonNumericUsia.length);
    console.log(nonNumericUsia);
    
    console.log('\n--- Checking for non-numeric id_asnaf values ---');
    const nonNumericAsnaf = await sql`
      SELECT id, id_asnaf 
      FROM ambulan_activity 
      WHERE id_asnaf::text !~ '^[0-9]+$' AND id_asnaf IS NOT NULL
      LIMIT 5
    `;
    console.log('Records with non-numeric id_asnaf:', nonNumericAsnaf.length);
    console.log(nonNumericAsnaf);
    
  } catch (error) {
    console.error('Error finding N/A values:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  findNaValues();
}

module.exports = { findNaValues };