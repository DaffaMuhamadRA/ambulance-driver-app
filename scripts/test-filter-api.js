const https = require('https');

console.log('Testing Admin Filter API...');

// Test basic request
const adminReq1 = https.get('https://localhost:3001/api/admin/activities', (res) => {
  console.log('Basic request status:', res.statusCode);
});

// Test date filter
const adminReq2 = https.get('https://localhost:3001/api/admin/activities?dateFrom=2023-01-01&dateTo=2023-12-31', (res) => {
  console.log('Date filter request status:', res.statusCode);
});

// Test location filter
const adminReq3 = https.get('https://localhost:3001/api/admin/activities?location=Jakarta', (res) => {
  console.log('Location filter request status:', res.statusCode);
});

// Test driver name filter
const adminReq4 = https.get('https://localhost:3001/api/admin/activities?driverName=John', (res) => {
  console.log('Driver name filter request status:', res.statusCode);
});

// Test combined filters
const adminReq5 = https.get('https://localhost:3001/api/admin/activities?dateFrom=2023-01-01&dateTo=2023-12-31&driverName=John&location=Jakarta', (res) => {
  console.log('Combined filter request status:', res.statusCode);
});

console.log('Admin Filter API tests completed.');

console.log('Testing Driver Filter API...');

// Test basic request
const driverReq1 = https.get('https://localhost:3001/api/driver/activities', (res) => {
  console.log('Basic request status:', res.statusCode);
});

// Test date filter
const driverReq2 = https.get('https://localhost:3001/api/driver/activities?dateFrom=2023-01-01&dateTo=2023-12-31', (res) => {
  console.log('Date filter request status:', res.statusCode);
});

// Test location filter
const driverReq3 = https.get('https://localhost:3001/api/driver/activities?location=Jakarta', (res) => {
  console.log('Location filter request status:', res.statusCode);
});

// Test combined filters
const driverReq4 = https.get('https://localhost:3001/api/driver/activities?dateFrom=2023-01-01&dateTo=2023-12-31&location=Jakarta', (res) => {
  console.log('Combined filter request status:', res.statusCode);
});

console.log('Driver Filter API tests completed.');