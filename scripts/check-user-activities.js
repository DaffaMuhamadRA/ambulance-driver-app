// Check activities for a specific user
const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkUserActivities() {
  try {
    console.log('Checking activities for user Agus Setiawan (ID: 3)...');
    
    const sql = neon(connectionString);
    
    // Get activities for user ID 3 (id_driver)
    const activities = await sql`
      SELECT 
        id, tgl, tgl_pulang, dari, tujuan, jam_berangkat, jam_pulang, biaya_antar, km_awal, km_akhir, nama_pemesan, hp, nama_pm, area, asisten_luar_kota, alamat_pm, jenis_kelamin_pm, usia_pm, nik, no_kk, tempat_lahir, tgl_lahir, status_marital, kegiatan, rumpun_program, diagnosa_sakit, agama, infaq, biaya_dibayar, id_asnaf, id_ambulan, id_driver
      FROM ambulan_activity
      WHERE id_driver = 3
      ORDER BY id
    `;
    
    console.log(`Found ${activities.length} activities for user ID 3:`);
    activities.forEach(activity => {
      console.log(`  - Activity ID: ${activity.id}`);
      console.log(`    Date: ${activity.tgl}`);
      console.log(`    Detail: ${activity.dari} to ${activity.tujuan}`);
      console.log(`    Reward: ${activity.biaya_antar}`);
      console.log('');
    });
    
    return activities;
  } catch (error) {
    console.error('Error checking user activities:', error.message);
    return [];
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkUserActivities();
}

module.exports = { checkUserActivities };