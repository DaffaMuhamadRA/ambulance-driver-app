const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { connectionString } = require('./db-config');

async function testAuthAndActivities() {
  try {
    console.log('Testing authentication and activity filtering...');
    const sql = neon(connectionString);
    
    // Test 1: Authenticate admin user
    console.log('\n=== Test 1: Admin Authentication ===');
    const adminResult = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE email = ${'admin@crudbooster.com'} AND status = 'Active'
    `;
    
    if (adminResult.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const adminUser = adminResult[0];
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.id_cms_privileges == 1 ? "admin" : "driver"
    });
    
    // Test 2: Authenticate driver user
    console.log('\n=== Test 2: Driver Authentication ===');
    const driverResult = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo
      FROM cms_users 
      WHERE email = ${'ahmad_taufik@citasehat.org'} AND status = 'Active'
    `;
    
    if (driverResult.length === 0) {
      console.log('❌ Driver user not found');
      return;
    }
    
    const driverUser = driverResult[0];
    console.log('✅ Driver user found:', {
      id: driverUser.id,
      name: driverUser.name,
      email: driverUser.email,
      role: driverUser.id_cms_privileges == 1 ? "admin" : "driver"
    });
    
    // Get driver ID for the driver user
    const driverIdResult = await sql`
      SELECT id 
      FROM driver 
      WHERE username = ${driverUser.email}
    `;
    
    const driverId = driverIdResult.length > 0 ? driverIdResult[0].id : null;
    console.log('Driver ID:', driverId);
    
    // Test 3: Get activities for admin
    console.log('\n=== Test 3: Activities for Admin ===');
    const adminActivities = await sql`
      SELECT * 
      FROM ambulan_activity 
      ORDER BY tgl_insert DESC 
      LIMIT 5
    `;
    
    console.log(`✅ Admin can see ${adminActivities.length} activities`);
    
    // Test 4: Get activities for driver
    console.log('\n=== Test 4: Activities for Driver ===');
    if (driverId) {
      const driverActivities = await sql`
        SELECT * 
        FROM ambulan_activity 
        WHERE id_driver = ${driverId} 
        ORDER BY tgl_insert DESC 
        LIMIT 5
      `;
      
      console.log(`✅ Driver can see ${driverActivities.length} of their own activities`);
    } else {
      console.log('❌ Driver ID not found');
    }
    
    // Test 5: Count total activities
    console.log('\n=== Test 5: Activity Counts ===');
    const totalActivities = await sql`
      SELECT COUNT(*) as count 
      FROM ambulan_activity
    `;
    
    console.log(`Total activities: ${totalActivities[0].count}`);
    
    if (driverId) {
      const driverActivityCount = await sql`
        SELECT COUNT(*) as count 
        FROM ambulan_activity 
        WHERE id_driver = ${driverId}
      `;
      
      console.log(`Driver's activities: ${driverActivityCount[0].count}`);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthAndActivities();