// Test script to verify validation functions
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

function testValidation() {
  console.log('Testing validation functions...');
  
  // Test valid inputs
  console.log('\nTesting valid inputs:');
  const validEmail = validateStringInput('admin@crudbooster.com', 100, 1);
  console.log('Valid email:', validEmail);
  
  const validPassword = validateStringInput('123456', 100, 1);
  console.log('Valid password:', validPassword);
  
  // Test edge cases
  console.log('\nTesting edge cases:');
  const emptyEmail = validateStringInput('', 100, 1);
  console.log('Empty email:', emptyEmail);
  
  const nullEmail = validateStringInput(null, 100, 1);
  console.log('Null email:', nullEmail);
  
  const undefinedEmail = validateStringInput(undefined, 100, 1);
  console.log('Undefined email:', undefinedEmail);
  
  const shortEmail = validateStringInput('a', 100, 1);
  console.log('Short email:', shortEmail);
  
  const longEmail = validateStringInput('a'.repeat(150), 100, 1);
  console.log('Long email (should be truncated):', longEmail?.length);
  
  console.log('\n🎉 Validation test completed!');
}

testValidation();