/**
 * Timezone utility functions for GMT+7 (Asia/Jakarta)
 */

// Format date for display using GMT+7 timezone
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return "-";
  
  return new Date(dateString).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta", // GMT + 7
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format date for input fields (YYYY-MM-DD) using GMT+7 timezone
export function formatInputDate(dateValue: any): string {
  // Handle null or undefined
  if (!dateValue) return "";
  
  try {
    let date;
    
    // If it's already a Date object, use it directly
    if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      // Parse the string date
      date = new Date(dateValue);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date value:", dateValue);
      return "";
    }
    
    // For HTML date inputs, we want to use the GMT + 7 date to match the detail views
    // Convert to GMT + 7 and get the date part
    const gmtPlus7Date = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const year = gmtPlus7Date.getFullYear();
    const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for input:", dateValue, error);
    return "";
  }
}

// Get current date in GMT+7 timezone formatted for input fields
export function getCurrentDateInGMT7(): string {
  const now = new Date();
  const gmtPlus7Date = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const year = gmtPlus7Date.getFullYear();
  const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
  const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
