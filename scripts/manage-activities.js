// Activity management utilities
// For working with activities in Neon database
// Using the existing ambulan_activity table

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function listActivities() {
  try {
    console.log('Listing activities in database...');
    
    const sql = neon(connectionString);
    
    // Use the existing ambulan_activity table
    // Note: ambulan_activity table doesn't have created_at column
    const activities = await sql`
      SELECT id, tgl, tgl_pulang, dari, tujuan, jam_berangkat, jam_pulang, 
             id_driver, biaya_antar, status_layanan, tgl_insert
      FROM ambulan_activity
      ORDER BY tgl DESC
      LIMIT 10
    `;
    
    console.log(`Found ${activities.length} activities:`);
    activities.forEach(activity => {
      console.log(`  - ${activity.id}: ${activity.dari} → ${activity.tujuan} on ${activity.tgl}`);
      console.log(`    Driver ID: ${activity.id_driver}`);
      console.log(`    Status: ${activity.status_layanan}`);
      console.log(`    Cost: ${activity.biaya_antar}`);
      console.log(`    Time: ${activity.jam_berangkat} to ${activity.jam_pulang}`);
      console.log(`    Created: ${activity.tgl_insert}`);
    });
    
    return activities;
  } catch (error) {
    console.error('Error listing activities:', error.message);
    return [];
  }
}

async function findActivity(id) {
  try {
    console.log(`Finding activity with ID: ${id}`);
    
    const sql = neon(connectionString);
    
    // Use the existing ambulan_activity table
    const activities = await sql`
      SELECT id, tgl, tgl_pulang, dari, tujuan, jam_berangkat, jam_pulang, 
             id_driver, biaya_antar, status_layanan, nama_pemesan, hp, 
             nama_pm, alamat_pm, tgl_insert
      FROM ambulan_activity
      WHERE id = ${id}
    `;
    
    if (activities.length > 0) {
      const activity = activities[0];
      console.log('Activity found:');
      console.log(`  ID: ${activity.id}`);
      console.log(`  Date: ${activity.tgl} to ${activity.tgl_pulang}`);
      console.log(`  Time: ${activity.jam_berangkat} to ${activity.jam_pulang}`);
      console.log(`  From: ${activity.dari}`);
      console.log(`  To: ${activity.tujuan}`);
      console.log(`  Driver ID: ${activity.id_driver}`);
      console.log(`  Cost: ${activity.biaya_antar}`);
      console.log(`  Status: ${activity.status_layanan}`);
      console.log(`  Patient: ${activity.nama_pm}`);
      console.log(`  Phone: ${activity.hp}`);
      console.log(`  Address: ${activity.alamat_pm}`);
      console.log(`  Created at: ${activity.tgl_insert}`);
      return activity;
    } else {
      console.log('No activity found with that ID');
      return null;
    }
  } catch (error) {
    console.error('Error finding activity:', error.message);
    return null;
  }
}

async function listDriverActivities(driverId) {
  try {
    console.log(`Listing activities for driver ID: ${driverId}`);
    
    const sql = neon(connectionString);
    
    // Get activities for a specific driver
    const activities = await sql`
      SELECT id, tgl, tgl_pulang, dari, tujuan, jam_berangkat, jam_pulang, 
             biaya_antar, status_layanan, tgl_insert
      FROM ambulan_activity
      WHERE id_driver = ${driverId}
      ORDER BY tgl DESC
      LIMIT 20
    `;
    
    console.log(`Found ${activities.length} activities for driver ${driverId}:`);
    activities.forEach(activity => {
      console.log(`  - ${activity.id}: ${activity.dari} → ${activity.tujuan} on ${activity.tgl}`);
      console.log(`    Status: ${activity.status_layanan}`);
      console.log(`    Cost: ${activity.biaya_antar}`);
      console.log(`    Created: ${activity.tgl_insert}`);
    });
    
    return activities;
  } catch (error) {
    console.error('Error listing driver activities:', error.message);
    return [];
  }
}

async function createActivity(tgl, tglPulang, dari, tujuan, jamBerangkat, jamPulang, 
                             idDriver, biayaAntar, statusLayanan, namaPemesan, hp, 
                             namaPm, alamatPm) {
  try {
    console.log(`Creating activity from ${dari} to ${tujuan}`);
    
    const sql = neon(connectionString);
    
    const result = await sql`
      INSERT INTO ambulan_activity (tgl, tgl_pulang, dari, tujuan, jam_berangkat, jam_pulang, 
                                   id_driver, biaya_antar, status_layanan, nama_pemesan, hp, 
                                   nama_pm, alamat_pm, bulan, tahun, id_kantor, id_ambulan, 
                                   id_detail, area, km_awal, km_akhir, selisih_km, 
                                   biaya_dibayar, nik, no_kk, tempat_lahir, tgl_lahir, 
                                   jenis_kelamin_pm, usia_pm, id_asnaf, pembatalan, 
                                   keterbatasan, infaq, tgl_insert, id_reward, reward_driver, 
                                   reward_asisten)
      VALUES (${tgl}, ${tglPulang}, ${dari}, ${tujuan}, ${jamBerangkat}, ${jamPulang}, 
              ${idDriver}, ${biayaAntar}, ${statusLayanan}, ${namaPemesan}, ${hp}, 
              ${namaPm}, ${alamatPm}, EXTRACT(MONTH FROM ${tgl}), EXTRACT(YEAR FROM ${tgl}), 
              1, 1, 1, 'Area', 0, 0, 0, 0, '', '', '', ${tgl}, 'L', '0', 1, '', '', 0, 
              NOW(), 1, 0, 0)
      RETURNING id, tgl, tgl_pulang, dari, tujuan, id_driver, biaya_antar, status_layanan, tgl_insert
    `;
    
    console.log('✅ Activity created successfully:');
    console.log(`  ID: ${result[0].id}`);
    console.log(`  From: ${result[0].dari}`);
    console.log(`  To: ${result[0].tujuan}`);
    console.log(`  Date: ${result[0].tgl} to ${result[0].tgl_pulang}`);
    console.log(`  Driver ID: ${result[0].id_driver}`);
    console.log(`  Cost: ${result[0].biaya_antar}`);
    console.log(`  Status: ${result[0].status_layanan}`);
    console.log(`  Created at: ${result[0].tgl_insert}`);
    
    return result[0];
  } catch (error) {
    console.error('Error creating activity:', error.message);
    return null;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node manage-activities.js <command> [options]');
    console.log('Commands:');
    console.log('  list                           - List all activities');
    console.log('  find <id>                      - Find activity by ID');
    console.log('  driver <driver_id>             - List activities for a driver');
    console.log('  create <tgl> <tgl_pulang> <dari> <tujuan> <jam_berangkat> <jam_pulang> <id_driver> <biaya_antar> <status_layanan> <nama_pemesan> <hp> <nama_pm> <alamat_pm> - Create new activity');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'list':
      listActivities();
      break;
      
    case 'find':
      if (args.length < 2) {
        console.log('Usage: node manage-activities.js find <id>');
        process.exit(1);
      }
      findActivity(args[1]);
      break;
      
    case 'driver':
      if (args.length < 2) {
        console.log('Usage: node manage-activities.js driver <driver_id>');
        process.exit(1);
      }
      listDriverActivities(args[1]);
      break;
      
    case 'create':
      if (args.length < 14) {
        console.log('Usage: node manage-activities.js create <tgl> <tgl_pulang> <dari> <tujuan> <jam_berangkat> <jam_pulang> <id_driver> <biaya_antar> <status_layanan> <nama_pemesan> <hp> <nama_pm> <alamat_pm>');
        process.exit(1);
      }
      createActivity(
        args[1],  // tgl
        args[2],  // tgl_pulang
        args[3],  // dari
        args[4],  // tujuan
        args[5],  // jam_berangkat
        args[6],  // jam_pulang
        args[7],  // id_driver
        args[8],  // biaya_antar
        args[9],  // status_layanan
        args[10], // nama_pemesan
        args[11], // hp
        args[12], // nama_pm
        args[13]  // alamat_pm
      );
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = { listActivities, findActivity, listDriverActivities, createActivity };
