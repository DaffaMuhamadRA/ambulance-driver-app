# Database Structure Changes

## Overview
This document describes the recent changes made to the database structure to improve data normalization and relationships in the Ambulan-CitaSehat application.

## New Tables Created

### 1. pemesan Table
Stores information about customers who request ambulance services.

**Structure:**
- `id` (SERIAL, PRIMARY KEY) - Unique identifier
- `nama_pemesan` (VARCHAR, NOT NULL) - Customer name
- `hp` (VARCHAR, NOT NULL) - Customer phone number
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationship:**
- Linked to `ambulan_activity` table via `id_pemesan` foreign key

### 2. penerima_manfaat Table
Stores detailed information about the beneficiaries of ambulance services.

**Structure:**
- `id` (SERIAL, PRIMARY KEY) - Unique identifier
- `nama_pm` (VARCHAR, NOT NULL) - Beneficiary name
- `alamat_pm` (TEXT) - Beneficiary address
- `jenis_kelamin_pm` (VARCHAR) - Gender
- `usia_pm` (INTEGER) - Age
- `id_asnaf` (INTEGER, FOREIGN KEY) - Reference to asnaf table
- `nik` (VARCHAR) - National ID number
- `no_kk` (VARCHAR) - Family card number
- `tempat_lahir` (VARCHAR) - Place of birth
- `tgl_lahir` (DATE) - Date of birth
- `status_marital` (VARCHAR) - Marital status
- `agama` (VARCHAR) - Religion
- `created_at` (TIMESTAMP) - Creation timestamp

**Relationship:**
- Linked to `ambulan_activity` table via `id_penerima_manfaat` foreign key
- References `asnaf` table via `id_asnaf` foreign key

## Changes to Existing Tables

### ambulan_activity Table
Added two new foreign key columns:
- `id_pemesan` (INTEGER) - References `pemesan.id`
- `id_penerima_manfaat` (INTEGER) - References `penerima_manfaat.id`

## Data Migration
Existing data from the `ambulan_activity` table was migrated to populate the new tables:
1. Unique combinations of `nama_pemesan` and `hp` were extracted to create records in the `pemesan` table
2. Unique beneficiary information was extracted to create records in the `penerima_manfaat` table
3. Foreign key relationships were established in the `ambulan_activity` table

## Benefits
1. **Data Normalization**: Eliminates data duplication by storing customer and beneficiary information in separate tables
2. **Data Integrity**: Enforces referential integrity through foreign key constraints
3. **Maintainability**: Easier to update customer or beneficiary information in one place
4. **Query Performance**: More efficient queries through proper indexing and relationships
5. **Scalability**: Better structure for future enhancements and reporting

## Implementation Files
- `scripts/create-pemesan-table.js` - Creates pemesan table and migrates data
- `scripts/create-penerima-manfaat-table.js` - Creates penerima_manfaat table and migrates data
- `lib/activities.ts` - Updated to use JOINs with the new tables

## Verification
- All existing functionality remains intact
- New structure properly maintains data relationships
- Queries have been updated to use COALESCE for backward compatibility
