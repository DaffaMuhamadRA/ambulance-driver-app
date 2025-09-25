// Test script to verify time-based reward filtering logic
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

// Mock reward data based on what we saw in the database
const mockRewards = [
  { id: 1, jenis: 'karyawan', tipe: 'Jam Pengantaran 08.00 - 16.00', reward: 0 },
  { id: 2, jenis: 'karyawan', tipe: 'Jam Pengantaran 16.00 - 22.00', reward: 40000 },
  { id: 3, jenis: 'karyawan', tipe: 'Jam Pengantaran 22.00 - 03.00', reward: 60000 },
  { id: 4, jenis: 'karyawan', tipe: 'Jam Pengantaran 04.00 - 07.30', reward: 40000 },
  { id: 5, jenis: 'karyawan', tipe: 'Libur', reward: 60000 },
  { id: 6, jenis: 'karyawan', tipe: 'Sabtu 14.50 sd 23.00', reward: 40000 },
  { id: 7, jenis: 'freelance', tipe: 'Jam Pengantaran 08.00 - 16.00', reward: 45000 },
  { id: 8, jenis: 'freelance', tipe: 'Jam Pengantaran 16.00 - 22.00', reward: 40000 },
  { id: 9, jenis: 'freelance', tipe: 'Jam Pengantaran 22.00 - 03.00', reward: 60000 },
  { id: 10, jenis: 'freelance', tipe: 'Jam Pengantaran 04.00 - 07.30', reward: 40000 },
  { id: 11, jenis: 'freelance', tipe: 'Libur', reward: 60000 },
  { id: 13, jenis: 'karyawan', tipe: 'luar kota', reward: 150000 },
  { id: 14, jenis: 'freelance', tipe: 'luar kota', reward: 150000 },
  { id: 15, jenis: 'karyawan', tipe: 'lain-lain', reward: 35000 }
];

// Function to filter rewards based on time range (same logic as in the forms)
function getFilteredRewards(jamBerangkat, jamPulang, area, userRole) {
  // If we don't have both jam berangkat and jam pulang, show all rewards
  if (!jamBerangkat || !jamPulang) {
    return mockRewards;
  }

  const startHour = parseInt(jamBerangkat.split(":")[0]);
  const endHour = parseInt(jamPulang.split(":")[0]);
  
  // Determine which time range the selected hours fall into
  let validRewardTypes = new Set();
  
  // Special case: Luar Kota
  if (area === "Luar Kota") {
    validRewardTypes.add("luar kota");
  } else {
    // Saturday special case (14:50-23:00)
    if (startHour === 14 && endHour === 23) {
      validRewardTypes.add("Sabtu 14.50 sd 23.00");
    }
    // Regular time ranges
    else if ((startHour >= 8 && startHour < 16) && (endHour >= 8 && endHour < 16)) {
      validRewardTypes.add("Jam Pengantaran 08.00 - 16.00");
    } else if ((startHour >= 16 && startHour < 22) && (endHour >= 16 && endHour < 22)) {
      validRewardTypes.add("Jam Pengantaran 16.00 - 22.00");
    } else if ((startHour >= 22 || startHour < 3) && (endHour >= 22 || endHour < 3)) {
      validRewardTypes.add("Jam Pengantaran 22.00 - 03.00");
    } else if ((startHour >= 3 && startHour < 8) && (endHour >= 3 && endHour < 8)) {
      validRewardTypes.add("Jam Pengantaran 04.00 - 07.30");
    } else {
      // Default to Libur for irregular hours
      validRewardTypes.add("Libur");
    }
    
    // Always include special types
    validRewardTypes.add("luar kota");
    validRewardTypes.add("lain-lain");
  }
  
  // Filter rewards based on jenis and valid reward types
  const driverJenis = userRole !== "admin" ? "karyawan" : null;
  
  return mockRewards.filter(reward => {
    // For admin users, show all rewards
    // For driver users, filter by driver status (karyawan/freelance)
    const showReward = (userRole === "admin") || 
                      (userRole === "driver" && reward.jenis === "karyawan");
    
    // If we should show this reward based on user role, check time range
    if (showReward) {
      // Always show special types regardless of time
      if (reward.tipe === "luar kota" || reward.tipe === "lain-lain" || reward.tipe === "Libur") {
        return true;
      }
      // Show only rewards that match the valid time range
      return validRewardTypes.has(reward.tipe);
    }
    
    return false;
  });
}

// Test cases
const testCases = [
  {
    name: "Morning hours (10:00-11:00) - Dalam Kota - Admin user",
    jamBerangkat: "10:00",
    jamPulang: "11:00",
    area: "Dalam Kota",
    userRole: "admin",
    expectedTypes: [
      "Jam Pengantaran 08.00 - 16.00",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Evening hours (18:00-19:00) - Dalam Kota - Driver user",
    jamBerangkat: "18:00",
    jamPulang: "19:00",
    area: "Dalam Kota",
    userRole: "driver",
    expectedTypes: [
      "Jam Pengantaran 16.00 - 22.00",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Night hours (23:00-01:00) - Dalam Kota - Admin user",
    jamBerangkat: "23:00",
    jamPulang: "01:00",
    area: "Dalam Kota",
    userRole: "admin",
    expectedTypes: [
      "Jam Pengantaran 22.00 - 03.00",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Early morning hours (05:00-06:00) - Dalam Kota - Driver user",
    jamBerangkat: "05:00",
    jamPulang: "06:00",
    area: "Dalam Kota",
    userRole: "driver",
    expectedTypes: [
      "Jam Pengantaran 04.00 - 07.30",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Saturday hours (14:50-23:00) - Dalam Kota - Admin user",
    jamBerangkat: "14:50",
    jamPulang: "23:00",
    area: "Dalam Kota",
    userRole: "admin",
    expectedTypes: [
      "Sabtu 14.50 sd 23.00",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Irregular hours (10:00-12:00) - Dalam Kota - Driver user",
    jamBerangkat: "10:00",
    jamPulang: "12:00",
    area: "Dalam Kota",
    userRole: "driver",
    expectedTypes: [
      "Jam Pengantaran 08.00 - 16.00",
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  },
  {
    name: "Luar Kota - Any time - Admin user",
    jamBerangkat: "10:00",
    jamPulang: "12:00",
    area: "Luar Kota",
    userRole: "admin",
    expectedTypes: [
      "luar kota",
      "lain-lain",
      "Libur"
    ]
  }
];

console.log('=== Testing Time-Based Reward Filtering Logic ===\n');

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`--- Test Case ${index + 1}: ${testCase.name} ---`);
  console.log(`Time: ${testCase.jamBerangkat} - ${testCase.jamPulang}, Area: ${testCase.area}, User Role: ${testCase.userRole}`);
  
  const filteredRewards = getFilteredRewards(
    testCase.jamBerangkat,
    testCase.jamPulang,
    testCase.area,
    testCase.userRole
  );
  
  // Get unique reward types
  const actualTypes = [...new Set(filteredRewards.map(r => r.tipe))];
  console.log('Filtered Reward Types:');
  actualTypes.forEach(type => console.log(`  - ${type}`));
  
  // Check if all expected types are present
  const missingTypes = testCase.expectedTypes.filter(type => !actualTypes.includes(type));
  const extraTypes = actualTypes.filter(type => !testCase.expectedTypes.includes(type));
  
  if (missingTypes.length === 0 && extraTypes.length === 0) {
    console.log('✅ PASS: All expected types are present and no extra types');
  } else {
    if (missingTypes.length > 0) {
      console.log(`❌ FAIL: Missing expected types: ${missingTypes.join(', ')}`);
    }
    if (extraTypes.length > 0) {
      console.log(`❌ FAIL: Extra unexpected types: ${extraTypes.join(', ')}`);
    }
  }
  
  console.log('');
});

console.log('=== Summary ===');
console.log('The time-based reward filtering ensures that only relevant reward options are shown');
console.log('based on the selected jam berangkat and jam pulang times.');
console.log('Special reward types (luar kota, lain-lain, Libur) are always available regardless of time.');