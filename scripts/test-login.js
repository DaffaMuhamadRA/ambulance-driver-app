// Test script to verify the login functionality
const http = require('http');

// Test data
const postData = JSON.stringify({
  username: 'admin@crudbooster.com',
  password: '123456'
});

// Options for the request
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make the request
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', jsonData);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

// Write data to request body
req.write(postData);
req.end();
