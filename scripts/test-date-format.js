// Test the date formatting function
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  
  // If already in YYYY-MM-DD format, return as is
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    // Extract just the date part if it's a full datetime string
    const datePart = dateString.split('T')[0];
    return datePart;
  }
  
  // Try to parse various date formats
  try {
    let date;
    
    // Handle common date formats
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
      // MM/DD/YYYY format
      const parts = dateString.split('/');
      date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    } else if (dateString.match(/^\d{2}-\d{2}-\d{4}/)) {
      // MM-DD-YYYY format
      const parts = dateString.split('-');
      date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
    } else {
      // Try default parsing
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return "";
    }
    
    // Return in YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error parsing date string:", dateString, error);
    // If parsing fails, return the original string if it looks like a date
    if (dateString && (dateString.match(/\d{4}-\d{2}-\d{2}/) || dateString.match(/\d{2}\/\d{2}\/\d{4}/) || dateString.match(/\d{2}-\d{2}-\d{4}/))) {
      // If it's already in YYYY-MM-DD format, return it
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateString.split('T')[0];
      }
      return dateString;
    }
    return "";
  }
};

// Test with the date from activity 70
const testDate = "2025-09-18T17:00:00.000Z";
console.log("Input date:", testDate);
console.log("Formatted date:", formatDateForInput(testDate));