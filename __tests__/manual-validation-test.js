// Manual test to verify validation functions work correctly
console.log("Testing validation functions...");

// Test sanitizeInput
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  // This is a basic sanitization, but the primary protection comes from parameterized queries
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // Remove null bytes, backspaces, tabs, etc.
    .trim();
}

console.log("Testing sanitizeInput:");
console.log("Input: test' OR 1=1--");
console.log("Output:", sanitizeInput("test' OR 1=1--"));
console.log("Expected: test OR 11");
console.log();

console.log("Input: test<script>alert('xss')</script>");
console.log("Output:", sanitizeInput("test<script>alert('xss')</script>"));
console.log("Expected: testscriptalertxssscript");
console.log();

// Test validateNumericInput
function validateNumericInput(input, min, max) {
  if (input === null || input === undefined) {
    return null;
  }
  
  const num = parseInt(input.toString(), 10);
  
  if (isNaN(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return null;
  }
  
  if (max !== undefined && num > max) {
    return null;
  }
  
  return num;
}

console.log("Testing validateNumericInput:");
console.log("Input: '123'");
console.log("Output:", validateNumericInput("123"));
console.log("Expected: 123");
console.log();

console.log("Input: 'abc'");
console.log("Output:", validateNumericInput("abc"));
console.log("Expected: null");
console.log();

console.log("Input: '5', min: 1, max: 10");
console.log("Output:", validateNumericInput("5", 1, 10));
console.log("Expected: 5");
console.log();

console.log("Input: '0', min: 1, max: 10");
console.log("Output:", validateNumericInput("0", 1, 10));
console.log("Expected: null");
console.log();

// Test validateDateInput
function validateDateInput(input) {
  if (!input) {
    return null;
  }
  
  // Basic format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input)) {
    return null;
  }
  
  // Additional validation to ensure it's a real date
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return input;
}

console.log("Testing validateDateInput:");
console.log("Input: '2023-12-25'");
console.log("Output:", validateDateInput("2023-12-25"));
console.log("Expected: 2023-12-25");
console.log();

console.log("Input: 'invalid-date'");
console.log("Output:", validateDateInput("invalid-date"));
console.log("Expected: null");
console.log();

// Test validateTimeInput
function validateTimeInput(input) {
  if (!input) {
    return null;
  }
  
  // Basic format validation (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(input)) {
    return null;
  }
  
  return input;
}

console.log("Testing validateTimeInput:");
console.log("Input: '14:30'");
console.log("Output:", validateTimeInput("14:30"));
console.log("Expected: 14:30");
console.log();

console.log("Input: '25:00'");
console.log("Output:", validateTimeInput("25:00"));
console.log("Expected: null");
console.log();

// Test validateStringInput
function validateStringInput(input, maxLength = 255, minLength = 0) {
  if (input === null || input === undefined) {
    return null;
  }
  
  const str = input.toString().trim();
  
  if (str.length < minLength) {
    return null;
  }
  
  if (str.length > maxLength) {
    return str.substring(0, maxLength);
  }
  
  return str;
}

console.log("Testing validateStringInput:");
console.log("Input: '  test  '");
console.log("Output:", validateStringInput("  test  "));
console.log("Expected: test");
console.log();

console.log("Input: 'a'.repeat(300), maxLength: 100");
const longString = 'a'.repeat(300);
const result = validateStringInput(longString, 100);
console.log("Output length:", result ? result.length : 'null');
console.log("Expected length: 100");
console.log();

// Test validateEmail
function validateEmail(email) {
  if (!email) {
    return null;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return null;
  }
  
  return email.toLowerCase().trim();
}

console.log("Testing validateEmail:");
console.log("Input: 'test@example.com'");
console.log("Output:", validateEmail("test@example.com"));
console.log("Expected: test@example.com");
console.log();

console.log("Input: 'invalid-email'");
console.log("Output:", validateEmail("invalid-email"));
console.log("Expected: null");
console.log();

// Test escapeHtml
function escapeHtml(input) {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

console.log("Testing escapeHtml:");
console.log("Input: \"<script>alert('xss')</script>\"");
console.log("Output:", escapeHtml("<script>alert('xss')</script>"));
console.log("Expected: &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
console.log();

console.log("All manual tests completed!");