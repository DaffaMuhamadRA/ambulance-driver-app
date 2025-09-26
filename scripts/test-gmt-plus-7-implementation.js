// Test script for GMT+7 implementation
// Note: This is a JavaScript file that tests the TypeScript timezone utilities

console.log("=== Testing GMT+7 Implementation ===");

// Test 1: Manual implementation of GMT+7 formatting
console.log("\n1. Testing manual GMT+7 formatting:");

const testDate = "2025-09-18T17:00:00.000Z";

// Display date format (similar to formatDisplayDate)
const displayDate = new Date(testDate).toLocaleDateString("id-ID", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("Input:", testDate);
console.log("Display format:", displayDate);

// Input date format (similar to formatInputDate)
const dateObj = new Date(testDate);
const gmtPlus7Date = new Date(dateObj.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const year = gmtPlus7Date.getFullYear();
const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0');
const day = String(gmtPlus7Date.getDate()).padStart(2, '0');
const inputDate = `${year}-${month}-${day}`;
console.log("Input format:", inputDate);

// Test 2: Current date in GMT+7
console.log("\n2. Current date in GMT+7:");
const now = new Date();
const currentGmtPlus7 = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const currentYear = currentGmtPlus7.getFullYear();
const currentMonth = String(currentGmtPlus7.getMonth() + 1).padStart(2, '0');
const currentDay = String(currentGmtPlus7.getDate()).padStart(2, '0');
const currentDate = `${currentYear}-${currentMonth}-${currentDay}`;
console.log("Current date in GMT+7:", currentDate);

console.log("\n=== Test Completed ===");