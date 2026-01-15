# Loading Animation During Delete Implementation

## Overview
This document explains the implementation of loading animation during delete operations in both user and admin activity detail pages. When a user confirms deletion of an activity, a loading overlay with a spinner is displayed while the delete operation is in progress, providing visual feedback to the user.

## Changes Made

### 1. User Activity Detail Page (`app/activities/[id]/page.tsx`)

#### Added State
- Added a new state variable `deleting` to track the delete operation status:
  \`\`\`typescript
  const [deleting, setDeleting] = useState(false)
  \`\`\`

#### Modified `performDelete` Function
- Set `deleting` state to `true` when the delete operation starts
- Set `deleting` state to `false` in the `finally` block to ensure it's reset regardless of success or failure
- Added proper error handling in the `finally` block

#### UI Changes
- Added a loading overlay that appears when `deleting` is `true`:
  \`\`\`jsx
  {deleting && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-700">Menghapus aktivitas...</p>
      </div>
    </div>
  )}
  \`\`\`
- Disabled the "Hapus" (Delete) button during deletion to prevent multiple clicks
- Added `disabled={deleting}` to both desktop and mobile delete buttons

### 2. Admin Activity Detail Page (`app/admin/activities/[id]/page.tsx`)

#### Added State
- Added a new state variable `deleting` to track the delete operation status:
  \`\`\`typescript
  const [deleting, setDeleting] = useState(false)
  \`\`\`

#### Modified `performDelete` Function
- Set `deleting` state to `true` when the delete operation starts
- Set `deleting` state to `false` in the `finally` block to ensure it's reset regardless of success or failure

#### UI Changes
- Added a loading overlay that appears when `deleting` is `true`:
  \`\`\`jsx
  {deleting && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-700">Menghapus aktivitas...</p>
      </div>
    </div>
  )}
  \`\`\`
- Disabled the "Hapus" (Delete) button during deletion to prevent multiple clicks
- Added `disabled={deleting}` to both desktop and mobile delete buttons

## User Experience
1. User clicks the "Hapus" (Delete) button
2. Confirmation modal appears asking for confirmation
3. User clicks "Ya" (Yes) to confirm
4. Confirmation modal closes
5. Loading overlay with spinner appears with the text "Menghapus aktivitas..."
6. Delete API call is made in the background
7. Upon successful deletion, user is redirected to the appropriate page (dashboard for users, admin page for admins)
8. If deletion fails, an error alert is shown

## Technical Details
- Uses the existing `animate-spin` class for the spinner animation
- Uses the same green color (`border-green-600`) for consistency with the rest of the application
- Loading overlay has a semi-transparent black background (`bg-black bg-opacity-50`) to dim the background
- Overlay is positioned with `z-50` to ensure it appears above all other content
- Buttons are disabled during deletion to prevent multiple simultaneous delete requests
- The `finally` block ensures the loading state is always reset, even if the operation fails

## Benefits
- Provides clear visual feedback during delete operations
- Prevents multiple delete requests from being sent
- Improves user experience by showing that the system is working
- Maintains consistency with existing UI components and styling
