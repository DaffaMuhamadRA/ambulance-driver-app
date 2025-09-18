// Ambulance management utilities
// For working with ambulances in Neon database

const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');

async function listAmbulances() {
  try {
    console.log('Listing ambulances in database...');
    
    const sql = neon(connectionString);
    
    // First, let's get the actual column names from the ambulances table
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ambulances'
      ORDER BY ordinal_position
    `;
    
    console.log('Ambulances table columns:', columns.map(c => c.column_name).join(', '));
    
    // Use a query that matches the actual table structure
    const ambulances = await sql`
      SELECT id, nopol, kode, is_active, created_at
      FROM ambulances
      ORDER BY id
    `;
    
    console.log(`Found ${ambulances.length} ambulances:`);
    ambulances.forEach(ambulance => {
      console.log(`  - ${ambulance.id}: ${ambulance.nopol} (${ambulance.kode}) ${ambulance.is_active ? '[Active]' : '[Inactive]'}`);
    });
    
    return ambulances;
  } catch (error) {
    console.error('Error listing ambulances:', error.message);
    return [];
  }
}

async function findAmbulance(identifier) {
  try {
    console.log(`Finding ambulance with identifier: ${identifier}`);
    
    const sql = neon(connectionString);
    
    // Use a query that matches the actual table structure
    const ambulances = await sql`
      SELECT id, nopol, kode, is_active, created_at, updated_at
      FROM ambulances
      WHERE id = ${identifier} OR nopol = ${identifier} OR kode = ${identifier}
    `;
    
    if (ambulances.length > 0) {
      const ambulance = ambulances[0];
      console.log('Ambulance found:');
      console.log(`  ID: ${ambulance.id}`);
      console.log(`  Nopol: ${ambulance.nopol}`);
      console.log(`  Kode: ${ambulance.kode}`);
      console.log(`  Active: ${ambulance.is_active ? 'Yes' : 'No'}`);
      console.log(`  Created at: ${ambulance.created_at}`);
      console.log(`  Updated at: ${ambulance.updated_at || 'Never updated'}`);
      return ambulance;
    } else {
      console.log('No ambulance found with that identifier');
      return null;
    }
  } catch (error) {
    console.error('Error finding ambulance:', error.message);
    return null;
  }
}

async function createAmbulance(nopol, kode, isActive = true) {
  try {
    console.log(`Creating ambulance: ${nopol} (${kode})`);
    
    const sql = neon(connectionString);
    
    const result = await sql`
      INSERT INTO ambulances (nopol, kode, is_active)
      VALUES (${nopol}, ${kode}, ${isActive})
      RETURNING id, nopol, kode, is_active, created_at
    `;
    
    console.log('✅ Ambulance created successfully:');
    console.log(`  ID: ${result[0].id}`);
    console.log(`  Nopol: ${result[0].nopol}`);
    console.log(`  Kode: ${result[0].kode}`);
    console.log(`  Active: ${result[0].is_active ? 'Yes' : 'No'}`);
    console.log(`  Created at: ${result[0].created_at}`);
    
    return result[0];
  } catch (error) {
    console.error('Error creating ambulance:', error.message);
    return null;
  }
}

async function updateAmbulanceStatus(id, isActive) {
  try {
    console.log(`Updating ambulance ${id} active status to: ${isActive}`);
    
    const sql = neon(connectionString);
    
    const result = await sql`
      UPDATE ambulances 
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, nopol, kode, is_active, updated_at
    `;
    
    if (result.length > 0) {
      console.log('✅ Ambulance status updated successfully:');
      console.log(`  ID: ${result[0].id}`);
      console.log(`  Nopol: ${result[0].nopol}`);
      console.log(`  Kode: ${result[0].kode}`);
      console.log(`  Active: ${result[0].is_active ? 'Yes' : 'No'}`);
      console.log(`  Updated at: ${result[0].updated_at}`);
      return result[0];
    } else {
      console.log('❌ No ambulance found with that ID');
      return null;
    }
  } catch (error) {
    console.error('Error updating ambulance status:', error.message);
    return null;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node manage-ambulances.js <command> [options]');
    console.log('Commands:');
    console.log('  list                     - List all ambulances');
    console.log('  find <identifier>        - Find ambulance by ID, nopol, or kode');
    console.log('  create <nopol> <kode> [is_active] - Create new ambulance');
    console.log('  update-status <id> <is_active>    - Update ambulance active status');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'list':
      listAmbulances();
      break;
      
    case 'find':
      if (args.length < 2) {
        console.log('Usage: node manage-ambulances.js find <identifier>');
        process.exit(1);
      }
      findAmbulance(args[1]);
      break;
      
    case 'create':
      if (args.length < 3) {
        console.log('Usage: node manage-ambulances.js create <nopol> <kode> [is_active]');
        process.exit(1);
      }
      createAmbulance(args[1], args[2], args[3] === 'true' || args[3] === '1' || !args[3] ? true : false);
      break;
      
    case 'update-status':
      if (args.length < 3) {
        console.log('Usage: node manage-ambulances.js update-status <id> <is_active>');
        process.exit(1);
      }
      updateAmbulanceStatus(args[1], args[2] === 'true' || args[2] === '1');
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = { listAmbulances, findAmbulance, createAmbulance, updateAmbulanceStatus };
