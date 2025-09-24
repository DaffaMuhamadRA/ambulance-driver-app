// Simple test for validation functions
const { 
  sanitizeInput, 
  validateNumericInput, 
  validateDateInput, 
  validateTimeInput, 
  validateStringInput, 
  validateEmail,
  escapeHtml
} = require("../lib/validation");

// Simple test function
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error}`);
  }
}

// Simple assertion function
function assertEqual(actual, expected, message = "") {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}. ${message}`);
  }
}

// Test sanitizeInput
test("sanitizeInput should remove dangerous characters", () => {
  assertEqual(sanitizeInput("test' OR 1=1--"), "test OR 11");
  assertEqual(sanitizeInput("test<script>alert('xss')</script>"), "testscriptalertxssscript");
});

test("sanitizeInput should handle valid input", () => {
  assertEqual(sanitizeInput("valid input"), "valid input");
});

test("sanitizeInput should handle non-string input", () => {
  assertEqual(sanitizeInput(123), "");
});

// Test validateNumericInput
test("validateNumericInput should validate valid numbers", () => {
  assertEqual(validateNumericInput("123"), 123);
  assertEqual(validateNumericInput(456), 456);
});

test("validateNumericInput should return null for invalid numbers", () => {
  assertEqual(validateNumericInput("abc"), null);
  assertEqual(validateNumericInput(null), null);
  assertEqual(validateNumericInput(undefined), null);
});

// Test validateDateInput
test("validateDateInput should validate correct date format", () => {
  assertEqual(validateDateInput("2023-12-25"), "2023-12-25");
});

test("validateDateInput should return null for invalid dates", () => {
  assertEqual(validateDateInput("invalid-date"), null);
  assertEqual(validateDateInput("25-12-2023"), null);
  assertEqual(validateDateInput(""), null);
});

// Test validateTimeInput
test("validateTimeInput should validate correct time format", () => {
  assertEqual(validateTimeInput("14:30"), "14:30");
  assertEqual(validateTimeInput("09:15"), "09:15");
});

test("validateTimeInput should return null for invalid times", () => {
  assertEqual(validateTimeInput("25:00"), null); // Invalid hour
  assertEqual(validateTimeInput("12:75"), null); // Invalid minute
  assertEqual(validateTimeInput("invalid-time"), null);
  assertEqual(validateTimeInput(""), null);
});

// Test validateStringInput
test("validateStringInput should validate and trim strings", () => {
  assertEqual(validateStringInput("  test  "), "test");
});

test("validateStringInput should handle null and undefined", () => {
  assertEqual(validateStringInput(null), null);
  assertEqual(validateStringInput(undefined), null);
});

// Test validateEmail
test("validateEmail should validate correct email format", () => {
  assertEqual(validateEmail("test@example.com"), "test@example.com");
  assertEqual(validateEmail("user.name+tag@example.com"), "user.name+tag@example.com");
});

test("validateEmail should return null for invalid emails", () => {
  assertEqual(validateEmail("invalid-email"), null);
  assertEqual(validateEmail("@example.com"), null);
  assertEqual(validateEmail("test@"), null);
  assertEqual(validateEmail(""), null);
});

// Test escapeHtml
test("escapeHtml should escape HTML characters", () => {
  assertEqual(
    escapeHtml("<script>alert('xss')</script>"), 
    "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
  );
  assertEqual(
    escapeHtml(`"quotes" and 'apostrophes'`), 
    "&quot;quotes&quot; and &#x27;apostrophes&#x27;"
  );
});

test("escapeHtml should handle empty input", () => {
  assertEqual(escapeHtml(""), "");
});

console.log("All tests completed!");