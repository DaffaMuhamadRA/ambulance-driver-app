// Test the reference API routes
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testReferenceApis() {
  try {
    const sql = neon(connectionString);
    
    // Test kantors
    console.log('=== Testing kantors ===');
    const kantors = await sql`SELECT id, kantor FROM kantor ORDER BY kantor LIMIT 3`;
    console.log('Kantors:', kantors);
    
    // Test ambulans
    console.log('\n=== Testing ambulans ===');
    const ambulans = await sql`SELECT id, nopol FROM ambulan ORDER BY nopol LIMIT 3`;
    console.log('Ambulans:', ambulans);
    
    // Test details
    console.log('\n=== Testing details ===');
    const details = await sql`SELECT id, detail_antar FROM detail_antar ORDER BY detail_antar LIMIT 3`;
    console.log('Details:', details);
    
    // Test drivers
    console.log('\n=== Testing drivers ===');
    const drivers = await sql`SELECT id, name FROM cms_users WHERE id_cms_privileges != 1 ORDER BY name LIMIT 3`;
    console.log('Drivers:', drivers);
    
    // Test pemesans
    console.log('\n=== Testing pemesans ===');
    const pemesans = await sql`SELECT id, nama_pemesan, hp FROM pemesan ORDER BY nama_pemesan LIMIT 3`;
    console.log('Pemesans:', pemesans);
    
    // Test penerima_manfaats
    console.log('\n=== Testing penerima_manfaats ===');
    const penerimaManfaats = await sql`SELECT id, nama_pm FROM penerima_manfaat ORDER BY nama_pm LIMIT 3`;
    console.log('Penerima Manfaats:', penerimaManfaats);
    
    // Test asnafs
    console.log('\n=== Testing asnafs ===');
    const asnafs = await sql`SELECT id, asnaf FROM asnaf ORDER BY asnaf`;
    console.log('Asnafs:', asnafs);
    
    // Test rewards
    console.log('\n=== Testing rewards ===');
    const rewards = await sql`SELECT id, jenis, tipe FROM reward_pengantaran ORDER BY jenis, tipe LIMIT 3`;
    console.log('Rewards:', rewards);
    
  } catch (error) {
    console.error('Error testing reference APIs:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testReferenceApis();
}

module.exports = { testReferenceApis };
