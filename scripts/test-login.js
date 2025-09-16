// Test login functionality
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login API with driver user...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Agus Setiawan',
        password: '123456'
      })
    });
    
    console.log(`Login Status: ${response.status}`);
    console.log(`Login Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Login Response:', JSON.stringify(data, null, 2));
    
    // Test session API
    console.log('\nTesting session API...');
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session');
    console.log(`Session Status: ${sessionResponse.status}`);
    console.log(`Session Status Text: ${sessionResponse.statusText}`);
    
    const sessionData = await sessionResponse.json();
    console.log('Session Response:', JSON.stringify(sessionData, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();