// Database configuration for Neon Serverless Driver
// Following Neon's documentation: https://neon.com/docs/serverless/serverless-driver

// Neon database connection parameters
// Using process.env directly for Edge Runtime compatibility
const dbConfig = {
  host: process.env.PGHOST || 'ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech',
  database: process.env.PGDATABASE || 'neondb',
  user: process.env.PGUSER || 'neondb_owner',
  password: process.env.PGPASSWORD || 'npg_26wQetjypolP',
  sslMode: process.env.PGSSLMODE || 'require',
  channelBinding: process.env.PGCHANNELBINDING || 'require'
};

// Create connection string following Neon's recommended format
const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?sslmode=${dbConfig.sslMode}&channel_binding=${dbConfig.channelBinding}`;

module.exports = {
  dbConfig,
  connectionString
};