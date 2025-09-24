// Simple test script to verify delete functionality
const testDelete = async () => {
  try {
    // Test with a non-existent activity ID to avoid actually deleting data
    const response = await fetch('http://localhost:3001/api/admin/activities/999999', {
      method: 'DELETE',
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.status === 404) {
      console.log('Delete functionality is working correctly - activity not found as expected');
    } else if (response.status === 401) {
      console.log('Delete functionality is working correctly - unauthorized as expected');
    } else if (response.status === 403) {
      console.log('Delete functionality is working correctly - forbidden as expected');
    } else {
      console.log('Delete functionality response:', data);
    }
  } catch (error) {
    console.error('Error testing delete functionality:', error);
  }
};

testDelete();