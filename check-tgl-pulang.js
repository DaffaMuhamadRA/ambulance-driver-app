const { neon } = require('@neondatabase/serverless');

async function checkTglPulangColumn() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Checking for tgl_pulang column in dokumentasi_activity table...');
    
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dokumentasi_activity' 
      AND column_name = 'tgl_pulang'
    `;
    
    console.log('tgl_pulang column exists:', result.length > 0);
    
    if (result.length > 0) {
      console.log('Column found:', result[0]);
    } else {
      console.log('Column not found in dokumentasi_activity table');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTglPulangColumn();