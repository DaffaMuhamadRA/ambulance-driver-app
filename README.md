# Ambulan CitaSehat

Sistem manajemen armada ambulan untuk CitaSehat Foundation.

## Setup Database

### Menggunakan Database Neon (Cloud) - Default

Aplikasi ini sudah dikonfigurasi untuk menggunakan database Neon PostgreSQL yang berisi data yang sudah ada. Tidak perlu membuat data baru atau melakukan migrasi.

**Kredensial Database Neon**:
```
PGHOST='ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech'
PGDATABASE='neondb'
PGUSER='neondb_owner'
PGPASSWORD='npg_vGgHE25STeCr'
PGSSLMODE='require'
PGCHANNELBINDING='require'
```

### Menggunakan Database Lokal (PostgreSQL)

Jika ingin menggunakan database lokal:

1. Pastikan PostgreSQL sudah terinstal dan berjalan di sistem Anda
2. Uncomment konfigurasi database lokal di file `.env`:
   ```
   # Untuk database lokal (PostgreSQL)
   PGHOST=localhost
   PGDATABASE=ambulan_citasehat
   PGUSER=postgres
   PGPASSWORD=your_local_password
   PGPORT=5432
   PGSSLMODE=prefer
   PGCHANNELBINDING=disable
   ```

3. Comment konfigurasi database Neon:
   ```
   # Untuk database Neon PostgreSQL
   # PGHOST='ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech'
   # PGDATABASE='neondb'
   # PGUSER='neondb_owner'
   # PGPASSWORD='npg_vGgHE25STeCr'
   # PGSSLMODE='require'
   # PGCHANNELBINDING='require'
   # DATABASE_URL=postgresql://neondb_owner:npg_vGgHE25STeCr@ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. Buat database di PostgreSQL:
   ```sql
   CREATE DATABASE ambulan_citasehat;
   ```

5. Jalankan inisialisasi database:
   ```bash
   npm run db:init
   ```

### Menghapus Database Lokal

Untuk menghapus semua tabel dalam database lokal:

1. Pastikan konfigurasi database lokal aktif di `.env`
2. Jalankan perintah:
   ```bash
   npm run db:drop
   ```

### Membuat Hash Password

Untuk membuat hash password baru menggunakan bcrypt:

```bash
node scripts/generate-hash.js
```

### Menginisialisasi Database Secara Manual

Jika perlu menginisialisasi database secara manual:

1. Buat tabel:
   ```bash
   node scripts/create-tables.js
   ```

2. Isi data pengguna:
   ```bash
   node scripts/seed-users.js
   ```

3. Isi data aktivitas:
   ```bash
   node scripts/seed-activities.js
   ```

### Kredensial Pengguna yang Tersedia

Database Neon sudah berisi data pengguna yang dapat digunakan:

1. **Admin User**:
   - Username: `admin`
   - Email: `admin@crudbooster.com`
   - Password: `123456`
   - Role: `admin`

2. **Driver Users**:
   - Username: `aep.saepudin`
   - Email: `aep@citasehat.com`
   - Password: `123456`
   - Role: `driver`
   

**Catatan**: Database Neon mungkin berisi lebih banyak pengguna dengan berbagai email dan kredensial. Gunakan kredensial yang sesuai dengan data yang ada di database.

## Security Implementation

This application implements comprehensive security measures to prevent common web vulnerabilities:

### Input Validation and Sanitization

All user inputs are validated and sanitized using our custom validation library (`lib/validation.ts`):

1. **SQL Injection Prevention**:
   - Parameterized queries are used throughout the application
   - All string inputs are sanitized to remove dangerous characters
   - Numeric inputs are strictly validated and converted

2. **XSS Prevention**:
   - HTML escaping is applied to user inputs before rendering
   - String inputs are sanitized to remove potentially dangerous characters

3. **Input Validation**:
   - All API endpoints validate input parameters
   - Required fields are checked before processing
   - Data types are validated and converted appropriately
   - Length constraints are applied to string inputs
   - Range validation is applied to numeric inputs
   - Date and time formats are strictly validated

### Authentication Security

- Session tokens are properly validated and sanitized
- Passwords are securely hashed using bcrypt
- Session expiration is properly managed
- Role-based access control is implemented

### Security Testing

We have implemented comprehensive tests to verify the functionality of our validation utilities:
- Manual testing of all validation functions
- Verification of proper sanitization of malicious inputs
- Testing of edge cases and boundary conditions

For detailed information about the security implementation, see [SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md).

## Filter Functionality

This application now includes enhanced filter functionality for both admin and driver dashboards:

### Admin Filters
- Date range filtering (between two dates)
- Driver name filtering
- Location filtering (matches either "dari" or "tujuan" fields)

### Driver Filters
- Date range filtering (between two dates)
- Location filtering (matches either "dari" or "tujuan" fields)

### Key Features
- Filter area hidden by default with toggle visibility
- Apply button to manually trigger filter application
- Reset button to clear all filter values
- No automatic filtering during input (performance improvement)

### Documentation
For detailed information on how to use these filters, see:
- [HOW_TO_USE_FILTERS.md](HOW_TO_USE_FILTERS.md) - User guide
- [DEVELOPER_FILTER_GUIDE.md](DEVELOPER_FILTER_GUIDE.md) - Developer guide
- [FILTER_FINAL_IMPLEMENTATION.md](FILTER_FINAL_IMPLEMENTATION.md) - Technical implementation details
- [FINAL_FILTER_IMPLEMENTATION_REPORT.md](FINAL_FILTER_IMPLEMENTATION_REPORT.md) - Complete implementation report

## Deployment ke Vercel

### Persyaratan
- Akun Vercel (https://vercel.com)
- Project ini sudah dikonfigurasi untuk deployment ke Vercel

### Langkah-langkah Deployment

1. **Import Project ke Vercel**:
   - Masuk ke dashboard Vercel
   - Klik "New Project"
   - Pilih repository yang berisi project ini
   - Klik "Import"

2. **Konfigurasi Environment Variables**:
   Setelah import, tambahkan environment variables berikut di Vercel dashboard:
   ```
   PGHOST= ep-morning-firefly-a1s6gh0a-pooler.ap-southeast-1.aws.neon.tech
   PGDATABASE=neondb
   PGUSER=neondb_owner
   PGPASSWORD=npg_vGgHE25STeCr
   PGSSLMODE=require
   PGCHANNELBINDING=require
   ```

3. **Deploy**:
   - Klik "Deploy" untuk memulai deployment pertama
   - Vercel akan secara otomatis mendeteksi Next.js dan membangun project

4. **Verifikasi Deployment**:
   - Setelah deployment selesai, buka URL yang diberikan oleh Vercel
   - Coba akses halaman login dan lakukan login dengan kredensial yang tersedia

### Troubleshooting Deployment

Jika mengalami masalah saat deployment:

1. **Error 500 pada API routes**:
   - Pastikan environment variables sudah diatur dengan benar di Vercel
   - Periksa logs di Vercel dashboard untuk detail error

2. **Database Connection Issues**:
   - Verifikasi bahwa kredensial database benar
   - Pastikan database Neon dapat diakses dari Vercel (firewall settings)

3. **Environment Variables Tidak Terbaca**:
   - Pastikan tidak ada tanda kutip di sekitar nilai environment variables di Vercel

## Development

Jalankan server development:
```bash
pnpm dev
```

Bangun aplikasi untuk produksi:
```bash
pnpm build
```

Jalankan server produksi:
```bash
pnpm start
```

### Dynamic Base URL Configuration

This project uses a dynamic base URL configuration that automatically adapts to the current port without requiring manual updates. The configuration is handled in `lib/config.ts` and works as follows:

1. In browser environments, it uses `window.location.origin`
2. In development, it automatically detects the port from the `PORT` environment variable
3. For Vercel deployments, it uses the `VERCEL_URL` environment variable
4. As a fallback, it defaults to `http://localhost:3000`

This eliminates the need to manually update `NEXT_PUBLIC_BASE_URL` in the `.env` file when the development server runs on different ports.

## Skrip Database Utility

Beberapa skrip yang tersedia untuk memeriksa dan mengelola database:

- `node scripts/check-neon-users.js` - Memeriksa pengguna di database
- `node scripts/list-all-users.js` - Menampilkan semua pengguna
- `node scripts/check-all-tables.js` - Memeriksa semua tabel
- `node scripts/test-db.js` - Mengujian koneksi database
- `node scripts/verify-joko-user.js` - Memverifikasi pengguna tertentu