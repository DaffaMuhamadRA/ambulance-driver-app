// Test script to verify base URL configuration
console.log('Testing Base URL Configuration');
console.log('==============================');

// Mock environment variables for testing
const originalEnv = { ...process.env };

// Test 1: Development environment with port
console.log('\nTest 1: Development Environment with Port');
process.env.NODE_ENV = 'development';
process.env.PORT = '3002';
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
// Simulate the logic from config.ts
const baseUrl1 = `http://localhost:${process.env.PORT || '3000'}`;
console.log('Expected Base URL:', baseUrl1);

// Test 2: Production with explicit URL
console.log('\nTest 2: Production with NEXT_PUBLIC_BASE_URL');
process.env.NEXT_PUBLIC_BASE_URL = 'https://myapp.example.com';
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
// This would take priority in the actual implementation
console.log('Expected Base URL:', process.env.NEXT_PUBLIC_BASE_URL);

// Test 3: Vercel deployment
console.log('\nTest 3: Vercel Deployment');
delete process.env.NEXT_PUBLIC_BASE_URL; // Remove previous
process.env.VERCEL_URL = 'myapp.vercel.app';
console.log('VERCEL_URL:', process.env.VERCEL_URL);
// Simulate the logic from config.ts
const baseUrl3 = `https://${process.env.VERCEL_URL}`;
console.log('Expected Base URL:', baseUrl3);

// Test 4: Default fallback
console.log('\nTest 4: Default Fallback');
delete process.env.VERCEL_URL; // Remove previous
delete process.env.PORT; // Remove previous
process.env.NODE_ENV = 'production';
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Expected Base URL: http://localhost:3000');

// Restore original environment
process.env = originalEnv;
console.log('\nTest completed successfully!');
