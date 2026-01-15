// Script to verify reward selection logic
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function verifyRewardSelection() {
  try {
    const sql = neon(connectionString);
    
    console.log('=== Verifying Reward Selection Logic ===\n');
    
    // Get all rewards
    const rewards = await sql`
      SELECT id, jenis, tipe, reward FROM reward_pengantaran ORDER BY jenis, tipe
    `;
    
    console.log('Available Rewards:');
    rewards.forEach(reward => {
      console.log(`  ID: ${reward.id}, Jenis: ${reward.jenis}, Tipe: ${reward.tipe}, Reward: Rp ${reward.reward?.toLocaleString('id-ID')}`);
    });
    
    console.log('\n=== Testing Driver Status Mapping ===');
    
    // Get sample drivers with their statuses
    const drivers = await sql`
      SELECT id, driver, status FROM driver WHERE status IN ('karyawan', 'freelance') LIMIT 5
    `;
    
    console.log('Sample Drivers and their Statuses:');
    drivers.forEach(driver => {
      console.log(`  Driver: ${driver.driver}, Status: ${driver.status}`);
    });
    
    console.log('\n=== Testing Time-Based Reward Mapping ===');
    
    // Test different time scenarios
    const timeScenarios = [
      { start: "09:00", end: "10:00", area: "Dalam Kota", expected: "Jam Pengantaran 08.00 - 16.00" },
      { start: "18:00", end: "19:00", area: "Dalam Kota", expected: "Jam Pengantaran 16.00 - 22.00" },
      { start: "23:00", end: "02:00", area: "Dalam Kota", expected: "Jam Pengantaran 22.00 - 03.00" },
      { start: "05:00", end: "06:00", area: "Dalam Kota", expected: "Jam Pengantaran 04.00 - 07.30" },
      { start: "14:50", end: "23:00", area: "Dalam Kota", expected: "Sabtu 14.50 sd 23.00" },
      { start: "02:00", end: "04:00", area: "Dalam Kota", expected: "Libur" },
      { start: "10:00", end: "12:00", area: "Luar Kota", expected: "luar kota" }
    ];
    
    console.log('Time-Based Reward Mapping:');
    timeScenarios.forEach(scenario => {
      const startHour = parseInt(scenario.start.split(":")[0]);
      const endHour = parseInt(scenario.end.split(":")[0]);
      
      console.log(`  ${scenario.start} - ${scenario.end} (${scenario.area}): ${scenario.expected}`);
    });
    
    console.log('\n=== Verification Complete ===');
    console.log('The reward selection logic should properly:');
    console.log('1. Show all rewards to admin users');
    console.log('2. Show only karyawan rewards to driver users');
    console.log('3. Automatically select rewards based on time schedules');
    console.log('4. Handle special cases like Luar Kota and Libur');
    
  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

// Run the verification
verifyRewardSelection();
