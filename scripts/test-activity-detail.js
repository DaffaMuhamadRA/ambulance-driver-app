// Test activity detail page
import fetch from 'node-fetch';

async function testActivityDetail() {
  try {
    console.log('Testing activity detail page...');
    
    // First, login to get a session cookie
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Agus Setiawan',
        password: '123456'
      })
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    
    // Get cookies from the response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Cookies received:', cookies);
    
    // Extract the session cookie
    let sessionCookie = '';
    if (cookies) {
      for (const cookie of cookies) {
        if (cookie.startsWith('session=')) {
          sessionCookie = cookie.split(';')[0];
          break;
        }
      }
    }
    console.log('Session cookie:', sessionCookie);
    
    // Now test the activity detail page with the session cookie
    // Using activity ID 51 which we know exists for this user
    console.log('Testing activity detail page for activity ID 51...');
    const activityResponse = await fetch('http://localhost:3001/activities/51', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    console.log(`Activity Detail Status: ${activityResponse.status}`);
    console.log(`Activity Detail Status Text: ${activityResponse.statusText}`);
    
    // Get the response content
    const content = await activityResponse.text();
    console.log('Activity Detail Content Length:', content.length);
    
    // Check if the content contains the expected elements
    if (content.includes('Detail Aktivitas')) {
      console.log('✅ Activity detail page loaded successfully');
    } else {
      console.log('❌ Activity detail page did not load correctly');
      // Print first 500 characters of content for debugging
      console.log('Content preview:', content.substring(0, 500));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testActivityDetail();