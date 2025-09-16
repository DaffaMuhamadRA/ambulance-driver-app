# Ambulan CitaSehat

Sistem manajemen armada ambulan untuk CitaSehat Foundation.

## Setup Database

### Menggunakan Database Neon (Cloud) - Default

Aplikasi ini sudah dikonfigurasi untuk menggunakan database Neon PostgreSQL yang berisi data yang sudah ada. Tidak perlu membuat data baru atau melakukan migrasi.

**Kredensial Database Neon**:
```
PGHOST=ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=npg_26wQetjypolP
PGSSLMODE=require
PGCHANNELBINDING=require
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
   # PGHOST=ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech
   # PGDATABASE=neondb
   # PGUSER=neondb_owner
   # PGPASSWORD=npg_26wQetjypolP
   # PGSSLMODE=require
   # PGCHANNELBINDING=require
   # DATABASE_URL=postgresql://neondb_owner:npg_26wQetjypolP@ep-orange-hall-a1dt84vj-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
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
   - Email: `admin@example.com`
   - Password: `password`
   - Role: `admin`

2. **Driver Users**:
   - Username: `aep.saepudin`
   - Email: `aep@citasehat.com`
   - Password: `password`
   - Role: `driver`
   
   - Username: `joko.s`
   - Email: `joko.s@example.com`
   - Password: `password`
   - Role: `driver`

**Catatan**: Database Neon mungkin berisi lebih banyak pengguna dengan berbagai email dan kredensial. Gunakan kredensial yang sesuai dengan data yang ada di database.

## Development

Jalankan server development:
```bash
npm run dev
```

Bangun aplikasi untuk produksi:
```bash
npm run build
```

Jalankan server produksi:
```bash
npm start
```

## Skrip Database Utility

Beberapa skrip yang tersedia untuk memeriksa dan mengelola database:

- `node scripts/check-neon-users.js` - Memeriksa pengguna di database
- `node scripts/list-all-users.js` - Menampilkan semua pengguna
- `node scripts/check-all-tables.js` - Memeriksa semua tabel
- `node scripts/test-db.js` - Mengujian koneksi database
- `node scripts/verify-joko-user.js` - Memverifikasi pengguna tertentu