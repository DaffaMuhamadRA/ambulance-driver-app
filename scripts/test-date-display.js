// Test how the date is displayed in different contexts
const dateString = "2025-09-18T17:00:00.000Z";

console.log("Original date string:", dateString);

// How it's displayed in detail view
const detailViewDate = new Date(dateString).toLocaleDateString("id-ID", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("Detail view display:", detailViewDate);

// How it should be formatted for edit view (HTML date input)
const editViewDate = new Date(dateString).toISOString().split('T')[0];
console.log("Edit view format:", editViewDate);

// Check what date the detail view is actually showing
const dateObj = new Date(dateString);
console.log("Date object:", dateObj);
console.log("UTC date:", dateObj.getUTCDate());
console.log("Local date:", dateObj.getDate());