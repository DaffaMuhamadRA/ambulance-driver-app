const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function checkJoinTables() {
  try {
    const sql = neon(connectionString);
    
    // Check detail_antar table
    const detailAntar = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'detail_antar' 
      ORDER BY ordinal_position
    `;
    
    console.log('detail_antar columns:');
    detailAntar.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check reward_pengantaran table
    const rewardPengantaran = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reward_pengantaran' 
      ORDER BY ordinal_position
    `;
    
    console.log('\nreward_pengantaran columns:');
    rewardPengantaran.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check pemesan table
    const pemesan = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pemesan' 
      ORDER BY ordinal_position
    `;
    
    console.log('\npemesan columns:');
    pemesan.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check penerima_manfaat table
    const penerimaManfaat = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'penerima_manfaat' 
      ORDER BY ordinal_position
    `;
    
    console.log('\npenerima_manfaat columns:');
    penerimaManfaat.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if detail_antar table has data
    const detailData = await sql`
      SELECT * FROM detail_antar LIMIT 3
    `;
    
    console.log('\ndetail_antar sample data:');
    console.log(detailData);
    
    // Check if reward_pengantaran table has data
    const rewardData = await sql`
      SELECT * FROM reward_pengantaran LIMIT 3
    `;
    
    console.log('\nreward_pengantaran sample data:');
    console.log(rewardData);
    
    // Check if pemesan table has data
    const pemesanData = await sql`
      SELECT * FROM pemesan LIMIT 3
    `;
    
    console.log('\npemesan sample data:');
    console.log(pemesanData);
    
    // Check if penerima_manfaat table has data
    const pmData = await sql`
      SELECT * FROM penerima_manfaat LIMIT 3
    `;
    
    console.log('\npenerima_manfaat sample data:');
    console.log(pmData);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkJoinTables();