# Database Management Scripts

This directory contains utility scripts for managing the Neon PostgreSQL database used by the Ambulan CitaSehat application. All scripts are designed to work with the Neon Serverless Driver and are compatible with Edge Runtime.

## Prerequisites

Before running these scripts, ensure you have set the following environment variables:

```bash
PGHOST='ep-odd-sunset-a178tsrs-pooler.ap-southeast-1.aws.neon.tech'
PGDATABASE='neondb'
PGUSER='neondb_owner'
PGPASSWORD='npg_26wQetjypolP'
PGSSLMODE='require'
PGCHANNELBINDING='require'
```

## Connection Testing

### Test Database Connection
```bash
npm run db:test-connection
```
This script tests the connection to the Neon database and verifies access to required tables.

### Check Database Schema
```bash
npm run db:check-schema
```
This script validates that all required tables exist and displays their structure.

## User Management

### List All Users
```bash
npm run db:list-users
```

### Find a User
```bash
npm run db:find-user <username_or_email>
```

### Verify User Password
```bash
npm run db:verify-password <email> <password>
```

### Create a New User
```bash
npm run db:create-user <name> <email> <password> <privilege_id> [status]
```

## Session Management

### List Active Sessions
```bash
npm run db:list-sessions
```

### Clean Expired Sessions
```bash
npm run db:clean-sessions
```

### Delete a Session
```bash
npm run db:delete-session <session_token>
```

## Activity Management

### List All Activities
```bash
npm run db:list-activities
```

### Find an Activity
```bash
npm run db:find-activity <activity_id>
```

### List Driver Activities
```bash
npm run db:list-driver-activities <driver_id>
```

### Create a New Activity
```bash
npm run db:create-activity <tgl> <tgl_pulang> <dari> <tujuan> <jam_berangkat> <jam_pulang> <id_driver> <biaya_antar> <status_layanan> <nama_pemesan> <hp> <nama_pm> <alamat_pm>
```

## Ambulance Management

### List All Ambulances
```bash
npm run db:list-ambulances
```

### Find an Ambulance
```bash
npm run db:find-ambulance <id_or_nopol_or_kode>
```

### Create a New Ambulance
```bash
npm run db:create-ambulance <nopol> <kode> [is_active]
```

### Update Ambulance Status
```bash
npm run db:update-ambulance-status <ambulance_id> <is_active>
```

## Available Status Values

### User Privileges
- `1` - Admin
- `2` - Driver

### Activity Status
- `pending`
- `in_progress`
- `completed`
- `cancelled`

### Activity Priority
- `low`
- `medium`
- `high`
- `urgent`

### Ambulance Status
- `true` - Active
- `false` - Inactive

## Direct Script Execution

You can also run the scripts directly using Node.js:

```bash
node scripts/test-connection.js
node scripts/check-schema.js
node scripts/manage-users.js <command> [options]
node scripts/manage-sessions.js <command> [options]
node scripts/manage-activities.js <command> [options]
node scripts/manage-ambulances.js <command> [options]
```

For help with each script's commands:
```bash
node scripts/manage-users.js
node scripts/manage-sessions.js
node scripts/manage-activities.js
node scripts/manage-ambulances.js
```