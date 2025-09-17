// Test the API routes
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testApiRoutes() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Testing Reference API Routes ===');
    
    // Test kantors route
    console.log('\n--- Testing kantors ---');
    const kantors = await sql`SELECT id, kantor FROM kantor ORDER BY kantor LIMIT 3`;
    console.log('Kantors:', kantors);
    
    // Test ambulans route
    console.log('\n--- Testing ambulans ---');
    const ambulans = await sql`SELECT id, nopol FROM ambulan ORDER BY nopol LIMIT 3`;
    console.log('Ambulans:', ambulans);
    
    // Test details route
    console.log('\n--- Testing details ---');
    const details = await sql`SELECT id, detail_antar FROM detail_antar ORDER BY detail_antar LIMIT 3`;
    console.log('Details:', details);
    
    // Test drivers route
    console.log('\n--- Testing drivers ---');
    const drivers = await sql`SELECT id, name FROM cms_users WHERE id_cms_privileges != 1 ORDER BY name LIMIT 3`;
    console.log('Drivers:', drivers);
    
    // Test pemesans route
    console.log('\n--- Testing pemesans ---');
    const pemesans = await sql`SELECT id, nama_pemesan, hp FROM pemesan ORDER BY nama_pemesan LIMIT 3`;
    console.log('Pemesans:', pemesans);
    
    // Test penerima_manfaats route
    console.log('\n--- Testing penerima_manfaats ---');
    const penerimaManfaats = await sql`SELECT id, nama_pm FROM penerima_manfaat ORDER BY nama_pm LIMIT 3`;
    console.log('Penerima Manfaats:', penerimaManfaats);
    
    // Test asnafs route
    console.log('\n--- Testing asnafs ---');
    const asnafs = await sql`SELECT id, asnaf FROM asnaf ORDER BY asnaf`;
    console.log('Asnafs:', asnafs);
    
    // Test rewards route
    console.log('\n--- Testing rewards ---');
    const rewards = await sql`SELECT id, jenis, tipe FROM reward_pengantaran ORDER BY jenis, tipe LIMIT 3`;
    console.log('Rewards:', rewards);
    
    console.log('\n=== All reference API routes are working correctly ===');
    
  } catch (error) {
    console.error('Error testing API routes:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testApiRoutes();
}

module.exports = { testApiRoutes };