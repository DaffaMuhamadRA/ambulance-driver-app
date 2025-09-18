// Test environment variables
console.log('Environment Variables:');
console.log('PGHOST:', process.env.PGHOST || 'Not set');
console.log('PGDATABASE:', process.env.PGDATABASE || 'Not set');
console.log('PGUSER:', process.env.PGUSER || 'Not set');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'Set (hidden for security)' : 'Not set');
console.log('PGSSLMODE:', process.env.PGSSLMODE || 'Not set');
console.log('PGCHANNELBINDING:', process.env.PGCHANNELBINDING || 'Not set');

// Test with values from .env file
console.log('\nValues from .env file:');
console.log('PGHOST: ep-odd-sunset-a178tsrs-pooler.ap-southeast-1.aws.neon.tech');
console.log('PGDATABASE: neondb');
console.log('PGUSER: neondb_owner');
console.log('PGPASSWORD: npg_26wQetjypolP (from .env)');
console.log('PGSSLMODE: require');
console.log('PGCHANNELBINDING: require');