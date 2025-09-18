// Final test for date consistency using GMT + 7
const dateString = "2025-09-18T17:00:00.000Z";

console.log("=== Final Date Consistency Test (GMT + 7) ===");
console.log("Original date string:", dateString);

// Detail view approach (GMT + 7)
const detailViewDate = new Date(dateString).toLocaleDateString("id-ID", {
  timeZone: "Asia/Jakarta", // GMT + 7
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("Detail view display:", detailViewDate);

// Edit view approach (GMT + 7 date part only)
const date = new Date(dateString);
const gmtPlus7InputDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const year = gmtPlus7InputDate.getFullYear();
const month = String(gmtPlus7InputDate.getMonth() + 1).padStart(2, '0');
const day = String(gmtPlus7InputDate.getDate()).padStart(2, '0');
const editViewDate = `${year}-${month}-${day}`;
console.log("Edit view format:", editViewDate);

console.log("\n=== Consistency Check ===");
console.log("Do detail view and edit view match?", 
  detailViewDate.includes("19") && editViewDate === "2025-09-19" ? "YES" : "NO");

console.log("\n=== Explanation ===");
console.log("The original UTC date '2025-09-18T17:00:00.000Z' is:");
console.log("- September 18 in UTC");
console.log("- September 19 in GMT + 7 (Asia/Jakarta)");
console.log("Both views now consistently show September 19 when using GMT + 7.");