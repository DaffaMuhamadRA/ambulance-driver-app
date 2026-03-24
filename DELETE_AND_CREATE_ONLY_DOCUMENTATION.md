# Documentation Upload System - Delete and Create Only Approach

## Overview
This document describes the implementation of a file upload system that only allows deletion and creation operations, even during editing. This means that when editing, users can only delete existing files or add new ones, but cannot modify existing files directly.

## Implementation Details

### 1. Backend Changes (API Route)
- Modified the PUT route in `/app/api/activities/[id]/route.ts` to handle documentation deletion and creation separately
- Added parsing of `documentationToDelete` parameter from form data
- Implemented logic to delete specified documentation records before creating new ones
- Maintained the existing approach for creating new documentation files

### 2. Frontend Changes (Edit Page)
- Added `documentationToDelete` state array to track files marked for deletion
- Modified the `removeExistingDocumentation` function to add files to the deletion list instead of immediately deleting them
- Updated the form submission to include the `documentationToDelete` data as a JSON string
- Added visual feedback to show how many files will be deleted upon saving

### 3. Database Operations
- During edit operations, the system now:
  1. First deletes any documentation records marked for removal
  2. Then creates new documentation records for any uploaded files
  3. Never modifies existing documentation records directly

## Benefits
- Clearer user experience: Users understand they can only add or remove files, not modify existing ones
- Better data integrity: Documentation records maintain their original properties
- Simplified logic: No need to handle file replacement scenarios
- Consistent behavior: Same approach works for both create and edit operations

## How It Works

### During Editing:
1. User views existing documentation files in the gallery
2. User can click the "X" button to mark a file for deletion (file is removed from display but not yet deleted)
3. User can upload new files using the file upload component
4. When saving changes:
   - All marked files are deleted from the database
   - All new files are uploaded to storage and added to the database

### During Creation:
- Same approach but without any existing files to delete

## Technical Implementation

### API Route Changes:
- Added parsing of `documentationToDelete` form field
- Implemented separate database operations for deletion and creation
- Maintained error handling for both operations

### Frontend Changes:
- Added state management for tracking files to delete
- Modified form submission to include deletion data
- Updated UI to show pending deletions

## Testing
The implementation has been tested to ensure:
- Files can be marked for deletion and are properly removed on save
- New files can be uploaded and are properly added on save
- Mixed operations (delete some, add others) work correctly
- Error handling works for both deletion and creation operations
