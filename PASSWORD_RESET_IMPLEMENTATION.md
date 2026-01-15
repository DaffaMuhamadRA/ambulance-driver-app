# Password Reset Feature Implementation

## Overview
This document describes the implementation of the password reset feature for the Ambulan Cita Sehat application. The feature allows users to reset their password if they forget it by following these steps:

1. User requests a password reset by entering their email
2. System generates a reset token and sends it to the user's email
3. User enters the token and sets a new password
4. System validates the token and updates the password

## Implementation Details

### 1. Database Schema
The existing `cms_users` table already has a `token` column that can be used for password reset functionality:

\`\`\`sql
- token (text) NULL
\`\`\`

### 2. API Endpoints

#### a. Request Password Reset
- **Endpoint**: `POST /api/auth/reset-password/request`
- **Purpose**: Generates a reset token and stores it in the database
- **Request Body**:
  \`\`\`json
  {
    "email": "user@example.com"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "success": true,
    "message": "Jika email Anda terdaftar, Anda akan menerima instruksi untuk mereset password Anda."
  }
  \`\`\`

#### b. Verify Token and Reset Password
- **Endpoint**: `POST /api/auth/reset-password/verify`
- **Purpose**: Verifies the reset token and updates the user's password
- **Request Body**:
  \`\`\`json
  {
    "token": "reset_token_here",
    "password": "new_password",
    "confirmPassword": "new_password"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "success": true,
    "message": "Password berhasil diubah. Anda dapat login dengan password baru Anda."
  }
  \`\`\`

### 3. Frontend Components

#### a. Password Reset Form
- **File**: `components/password-reset-form.tsx`
- **Features**:
  - Two-step process (request and reset)
  - Form validation
  - Error handling
  - Success messaging
  - Navigation between steps

#### b. Reset Password Page
- **File**: `app/reset-password/page.tsx`
- **Features**:
  - Dedicated page for password reset
  - Support for token parameter in URL
  - Responsive design matching login page

#### c. Login Form Update
- **File**: `components/login-form.tsx`
- **Changes**:
  - Added "Lupa password?" link that navigates to reset password page

### 4. Security Considerations

1. **Token Generation**: Uses cryptographically secure random token generation
2. **Token Expiration**: Tokens expire after 1 hour
3. **Password Hashing**: New passwords are hashed using bcrypt before storage
4. **Email Enumeration Prevention**: Same response is returned regardless of whether email exists
5. **Input Validation**: All inputs are sanitized and validated

### 5. Token Management

- Tokens are stored in the `token` column of the `cms_users` table
- Tokens are cleared after successful password reset
- Expired tokens are rejected during verification

### 6. Testing

Test scripts are included to verify the functionality:
- `scripts/test-password-reset.js`: Basic token validation
- `scripts/test-reset-password-api.js`: Comprehensive API testing

## Usage Instructions

1. User navigates to the login page
2. User clicks "Lupa password?" link
3. User enters their email on the reset password page
4. System generates a token and (in production) sends it via email
5. User receives the token and enters it on the reset password page
6. User enters new password and confirmation
7. System validates token and updates password
8. User can now login with new password

## Future Improvements

1. **Email Integration**: Integrate with email service to automatically send reset tokens
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Audit Logging**: Log password reset attempts for security monitoring
4. **UI/UX Enhancements**: Add loading states and improved error messaging
