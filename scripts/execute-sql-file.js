const { neon } = require('@neondatabase/serverless');
const { connectionString } = require('./db-config');
const fs = require('fs');

async function executeSqlFile(filePath) {
  try {
    const sql = neon(connectionString);
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim().length > 0) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement);
      }
    }
    
    console.log('Successfully executed SQL file:', filePath);
  } catch (error) {
    console.error('Error executing SQL file:', error.message);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  const filePath = process.argv[2];
  if (filePath) {
    executeSqlFile(filePath);
  } else {
    console.log('Please provide a SQL file path as an argument');
  }
}

module.exports = { executeSqlFile };
