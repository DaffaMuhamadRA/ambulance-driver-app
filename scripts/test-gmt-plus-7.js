// Test GMT + 7 date formatting
const dateString = "2025-09-18T17:00:00.000Z";

console.log("=== GMT + 7 Date Formatting Test ===");
console.log("Original date string:", dateString);

// UTC date display
const utcDate = new Date(dateString).toLocaleDateString("id-ID", {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("UTC date display:", utcDate);

// GMT + 7 date display
const gmtPlus7Date = new Date(dateString).toLocaleDateString("id-ID", {
  timeZone: "Asia/Jakarta", // GMT + 7
  year: "numeric",
  month: "long",
  day: "numeric",
});
console.log("GMT + 7 date display:", gmtPlus7Date);

// GMT + 7 date for input (what we want in edit view)
const date = new Date(dateString);
const gmtPlus7InputDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const year = gmtPlus7InputDate.getFullYear();
const month = String(gmtPlus7InputDate.getMonth() + 1).padStart(2, '0');
const day = String(gmtPlus7InputDate.getDate()).padStart(2, '0');
const formattedForInput = `${year}-${month}-${day}`;
console.log("GMT + 7 for input:", formattedForInput);

console.log("\n=== Date Values ===");
console.log("UTC date:", date.getUTCDate());
console.log("Local date:", date.getDate());
console.log("GMT + 7 date:", gmtPlus7InputDate.getDate());

console.log("\n=== Consistency Check ===");
console.log("Do GMT + 7 detail view and edit view match?", 
  gmtPlus7Date.includes("19") && formattedForInput === "2025-09-19" ? "YES" : "NO");