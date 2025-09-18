import { neon } from "@neondatabase/serverless";

// Database configuration - using environment variables directly
// This approach is compatible with Edge Runtime
const PGHOST = process.env.PGHOST || 'ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech';
const PGDATABASE = process.env.PGDATABASE || 'neondb';
const PGUSER = process.env.PGUSER || 'neondb_owner';
const PGPASSWORD = process.env.PGPASSWORD || 'npg_26wQetjypolP';
const PGSSLMODE = process.env.PGSSLMODE || 'require';
const PGCHANNELBINDING = process.env.PGCHANNELBINDING || 'require';

// Create connection string using the provided Neon PostgreSQL parameters
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=${PGSSLMODE}&channel_binding=${PGCHANNELBINDING}`;

// Create and export the SQL client
export const sql = neon(connectionString);
