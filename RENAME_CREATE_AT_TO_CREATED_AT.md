# Documentation Table Column Rename - create_at to created_at

## Overview
This document describes the changes made to rename the `create_at` column to `created_at` in the `dokumentasi_activity` table for consistency with common naming conventions.

## Changes Made

### 1. Database Migration
- Renamed the `create_at` column to `created_at` in the `dokumentasi_activity` table
- Updated the table creation scripts to use the correct column name

### 2. Codebase Updates
Updated all references to the column in the codebase:
- API routes (`app/api/activities/dokumentasi/route.ts`, `app/api/activities/[id]/route.ts`, `app/api/admin/activities/[id]/route.ts`)
- Library functions (`lib/activities.ts`)
- Test scripts (`scripts/test-activity-detail.js`, `test-insert.js`)
- Database creation scripts (`scripts/04-create-dokumentasi-table.sql`, `scripts/create-documentation-table.js`)

### 3. Migration Scripts
Created migration scripts to perform the rename:
- `scripts/rename-create-at-to-created-at.sql` - SQL version
- `scripts/rename-create-at-to-created-at.js` - JavaScript version

## Verification
- Successfully renamed the column in the database
- Verified the new column name appears in table structure queries
- Tested insert operations to ensure functionality remains intact
- All existing code now references the correctly named column

## Impact
This change improves code consistency and follows standard naming conventions for timestamp columns. There is no functional change, only a naming correction.
