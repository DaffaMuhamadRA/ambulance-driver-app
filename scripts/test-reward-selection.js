// Test script to verify jenis pengantaran selection logic
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function testRewardSelection() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Testing Jenis Pengantaran Selection Logic ===\n');
    
    // Get all rewards
    const rewards = await sql`
      SELECT id, jenis, tipe, reward FROM reward_pengantaran ORDER BY jenis, tipe
    `;
    
    console.log('Available Jenis Pengantaran:');
    rewards.forEach(reward => {
      console.log(`  ID: ${reward.id}, Jenis: ${reward.jenis}, Tipe: ${reward.tipe}, Reward: ${reward.reward}`);
    });
    
    console.log('\n=== Testing Time-Based Jenis Pengantaran Selection ===');
    
    // Test different time scenarios
    const testCases = [
      { 
        name: "Morning hours (08:00-10:00) - Dalam Kota", 
        start: "08:00", 
        end: "10:00", 
        area: "Dalam Kota",
        expectedType: "Jam Pengantaran 08.00 - 16.00"
      },
      { 
        name: "Evening hours (18:00-19:00) - Dalam Kota", 
        start: "18:00", 
        end: "19:00", 
        area: "Dalam Kota",
        expectedType: "Jam Pengantaran 16.00 - 22.00"
      },
      { 
        name: "Night hours (23:00-01:00) - Dalam Kota", 
        start: "23:00", 
        end: "01:00", 
        area: "Dalam Kota",
        expectedType: "Jam Pengantaran 22.00 - 03.00"
      },
      { 
        name: "Early morning hours (05:00-06:00) - Dalam Kota", 
        start: "05:00", 
        end: "06:00", 
        area: "Dalam Kota",
        expectedType: "Jam Pengantaran 04.00 - 07.30"
      },
      { 
        name: "Saturday hours (14:50-23:00) - Dalam Kota", 
        start: "14:50", 
        end: "23:00", 
        area: "Dalam Kota",
        expectedType: "Sabtu 14.50 sd 23.00"
      },
      { 
        name: "Irregular hours (10:00-12:00) - Dalam Kota", 
        start: "10:00", 
        end: "12:00", 
        area: "Dalam Kota",
        expectedType: "Jam Pengantaran 08.00 - 16.00"
      },
      { 
        name: "Luar Kota - Any time", 
        start: "10:00", 
        end: "12:00", 
        area: "Luar Kota",
        expectedType: "luar kota"
      }
    ];
    
    // Test each case
    for (const testCase of testCases) {
      console.log(`\n--- ${testCase.name} ---`);
      console.log(`Time: ${testCase.start} - ${testCase.end}, Area: ${testCase.area}`);
      
      // Determine time-based reward type
      let rewardType = "";
      const startHour = parseInt(testCase.start.split(":")[0]);
      const endHour = parseInt(testCase.end.split(":")[0]);
      
      // Check for special cases first
      if (testCase.area === "Luar Kota") {
        rewardType = "luar kota";
      } else {
        // Regular time-based rewards
        if ((startHour >= 8 && startHour < 16) && (endHour >= 8 && endHour < 16)) {
          rewardType = "Jam Pengantaran 08.00 - 16.00";
        } else if ((startHour >= 16 && startHour < 22) && (endHour >= 16 && endHour < 22)) {
          rewardType = "Jam Pengantaran 16.00 - 22.00";
        } else if ((startHour >= 22 || startHour < 3) && (endHour >= 22 || endHour < 3)) {
          rewardType = "Jam Pengantaran 22.00 - 03.00";
        } else if ((startHour >= 3 && startHour < 8) && (endHour >= 3 && endHour < 8)) {
          rewardType = "Jam Pengantaran 04.00 - 07.30";
        } else if (startHour === 14 && endHour === 23) {
          rewardType = "Sabtu 14.50 sd 23.00";
        } else {
          // Default to Libur for irregular hours
          rewardType = "Libur";
        }
      }
      
      console.log(`Expected: ${testCase.expectedType}`);
      console.log(`Actual: ${rewardType}`);
      console.log(`Result: ${rewardType === testCase.expectedType ? '✅ PASS' : '❌ FAIL'}`);
      
      // Find matching reward for karyawan
      const matchingReward = rewards.find(
        r => r.jenis === "karyawan" && r.tipe === rewardType
      );
      
      if (matchingReward) {
        console.log(`Matching Jenis Pengantaran: ${matchingReward.jenis} - ${matchingReward.tipe}`);
        console.log(`Reward Value: ${matchingReward.reward?.toLocaleString('id-ID') || 'N/A'}`);
      } else {
        console.log(`No matching jenis pengantaran found for ${rewardType}`);
      }
    }
    
    console.log('\n=== Testing New Read-Only Reward Field ===');
    console.log('The new Reward field in the UI should display the reward value from the selected jenis pengantaran.');
    console.log('For example, if "karyawan - Jam Pengantaran 08.00 - 16.00" is selected, the Reward field should show "40.000"');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRewardSelection();
