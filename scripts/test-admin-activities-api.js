// Test the admin activities API by simulating a request
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testAdminActivitiesAPI() {
  try {
    console.log('=== Testing Admin Activities API ===');
    
    // This would normally be handled by the Next.js API route
    // Let's directly test the getAllActivities function
    const { getAllActivities } = require('./lib/activities');
    
    console.log('Calling getAllActivities...');
    const activities = await getAllActivities();
    
    console.log('Success! Retrieved', activities.length, 'activities');
    console.log('First activity:', activities[0]);
    
  } catch (error) {
    console.error('Error testing admin activities API:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testAdminActivitiesAPI();
}

module.exports = { testAdminActivitiesAPI };
