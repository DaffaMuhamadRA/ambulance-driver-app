// Test date consistency across all views
const dateString = "2025-09-18T17:00:00.000Z";

console.log("=== Date Consistency Test ===");
console.log("Original date string:", dateString);

// Old detail view approach (local timezone)
const oldDetailViewDate = new Date(dateString).toLocaleDateString("id-ID", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("Old detail view display:", oldDetailViewDate);

// New detail view approach (UTC)
const newDetailViewDate = new Date(dateString).toLocaleDateString("id-ID", {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("New detail view display:", newDetailViewDate);

// Edit view approach (date part only)
const editViewDate = new Date(dateString).toISOString().split('T')[0];
console.log("Edit view format:", editViewDate);

// Check what date each approach shows
console.log("\nDate breakdown:");
console.log("UTC date:", new Date(dateString).getUTCDate());
console.log("Local date:", new Date(dateString).getDate());

console.log("\n=== Consistency Check ===");
console.log("Do new detail view and edit view match?", 
  newDetailViewDate.includes("18") && editViewDate === "2025-09-18" ? "YES" : "NO");
console.log("Do old detail view and edit view match?", 
  oldDetailViewDate.includes("18") && editViewDate === "2025-09-18" ? "YES" : "NO");