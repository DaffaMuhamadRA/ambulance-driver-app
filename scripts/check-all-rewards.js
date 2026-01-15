const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkAllRewards() {
  try {
    const sql = neon(connectionString);
    
    // Get all rewards
    const rewards = await sql`
      SELECT id, jenis, tipe, reward FROM reward_pengantaran ORDER BY jenis, tipe
    `;
    
    console.log('=== All reward_pengantaran records ===');
    rewards.forEach(reward => {
      console.log(`ID: ${reward.id}, Jenis: ${reward.jenis}, Tipe: ${reward.tipe}, Reward: ${reward.reward}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllRewards();
