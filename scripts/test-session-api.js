// Test session API with cookies
import fetch from 'node-fetch';

async function testSessionAPI() {
  try {
    console.log('Testing session API with cookies...');
    
    // First, login to get a session cookie
    console.log('Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
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
    
    // Now test the session API with the session cookie
    console.log('Testing session API...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    console.log(`Session Status: ${sessionResponse.status}`);
    const sessionData = await sessionResponse.json();
    console.log('Session Response:', JSON.stringify(sessionData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSessionAPI();