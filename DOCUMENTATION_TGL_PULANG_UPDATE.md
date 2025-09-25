# Documentation Table Update - tgl_pulang Column

## Overview
This document describes the changes made to add a `tgl_pulang` column to the `dokumentasi_activity` table that relates to the `ambulan_activity` table's `tgl_pulang` field.

## Changes Made

### 1. Database Migration
- Added a `tgl_pulang` column of type `DATE` to the `dokumentasi_activity` table
- Added a comment to explain the purpose of the column
- Created an index on the `tgl_pulang` column for better query performance
- Populated existing records with `tgl_pulang` data from the related `ambulan_activity` records

### 2. API Route Updates
Updated all API routes that insert documentation records to include the `tgl_pulang` column:

#### Frontend User Routes
- `app/api/activities/dokumentasi/route.ts` - POST and GET methods
- `app/api/activities/[id]/route.ts` - PUT method (update activity)
- `app/api/activities/route.ts` - POST method (create activity)

#### Admin Routes
- `app/api/admin/activities/[id]/route.ts` - PUT method (update activity)
- `app/api/admin/activities/route.ts` - POST method (create activity)

### 3. Migration Scripts
Created two migration scripts:
- `scripts/add-tgl-pulang-to-documentation-table.sql` - SQL version
- `scripts/add-tgl-pulang-to-documentation-table.js` - JavaScript version

### 4. Test Script
Created a test script to verify the migration:
- `scripts/test-documentation-tgl-pulang.js`

## How It Works
1. When a documentation record is inserted, the system fetches the `tgl_pulang` value from the related `ambulan_activity` record
2. The `tgl_pulang` value is stored alongside the documentation URL in the `dokumentasi_activity` table
3. This allows for easier querying and filtering of documentation based on the activity's return date

## Benefits
1. Improved data consistency by storing related date information together
2. Better query performance with the added index
3. Easier reporting and filtering capabilities
4. Enhanced data integrity with proper foreign key relationships

## Testing
The migration has been tested and verified to work correctly:
- Column exists check: ✓ Passed
- Insert test: ✓ Passed
- Select test: ✓ Passed
- Cleanup: ✓ Passed

## Rollback Plan
If needed, the migration can be rolled back by:
1. Removing the `tgl_pulang` column from the `dokumentasi_activity` table
2. Reverting the API route changes
3. Removing the index on the `tgl_pulang` column

Note: This would result in loss of any `tgl_pulang` data that was stored in the documentation records.