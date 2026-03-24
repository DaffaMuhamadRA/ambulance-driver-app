# Cara Menggunakan Fitur Filter

Dokumen ini menjelaskan cara menggunakan fitur filter yang telah diimplementasikan di dashboard admin dan driver.

## Filter di Dashboard Admin

Dashboard admin memiliki 4 filter yang dapat digunakan:

1. **Tanggal Mulai** - Filter berdasarkan tanggal keberangkatan (dari tanggal tertentu)
2. **Tanggal Selesai** - Filter berdasarkan tanggal keberangkatan (sampai tanggal tertentu)
3. **Nama Driver** - Filter berdasarkan driver yang menangani aktivitas (dalam bentuk dropdown)
4. **Lokasi** - Filter berdasarkan lokasi keberangkatan atau tujuan

### Cara Menggunakan Filter Admin

1. Klik ikon filter (bentuk corong) di pojok kanan atas dashboard
2. Panel filter akan muncul
3. Isi filter yang diinginkan:
   - Pilih tanggal mulai dan selesai untuk memfilter berdasarkan rentang tanggal
   - Pilih driver dari dropdown untuk memfilter aktivitas berdasarkan driver tertentu
   - Masukkan lokasi untuk memfilter aktivitas berdasarkan lokasi keberangkatan atau tujuan
4. Klik tombol "Terapkan" untuk menerapkan filter
5. Klik tombol "Reset" untuk menghapus semua filter yang telah diisi

## Filter di Dashboard Driver

Dashboard driver memiliki 3 filter yang dapat digunakan:

1. **Tanggal Mulai** - Filter berdasarkan tanggal keberangkatan (dari tanggal tertentu)
2. **Tanggal Selesai** - Filter berdasarkan tanggal keberangkatan (sampai tanggal tertentu)
3. **Lokasi** - Filter berdasarkan lokasi keberangkatan atau tujuan

### Cara Menggunakan Filter Driver

1. Klik ikon filter (bentuk corong) di pojok kanan atas dashboard
2. Panel filter akan muncul
3. Isi filter yang diinginkan:
   - Pilih tanggal mulai dan selesai untuk memfilter berdasarkan rentang tanggal
   - Masukkan lokasi untuk memfilter aktivitas berdasarkan lokasi keberangkatan atau tujuan
4. Klik tombol "Terapkan" untuk menerapkan filter
5. Klik tombol "Reset" untuk menghapus semua filter yang telah diisi

## Perbedaan Filter Admin dan Driver

Perbedaan utama antara filter admin dan driver adalah:

- **Admin** dapat memfilter berdasarkan driver tertentu karena memiliki akses ke semua aktivitas
- **Driver** hanya dapat melihat dan memfilter aktivitas yang mereka tangani sendiri

## Implementasi Teknis

Filter diimplementasikan dengan pendekatan berikut:

1. **Komponen Reusable** - Komponen `ActivityFilter` digunakan di kedua dashboard
2. **State Management** - Setiap dashboard mengelola state filter sendiri
3. **API Integration** - Filter dikirim sebagai parameter query ke API routes
4. **Conditional Rendering** - Beberapa filter hanya muncul untuk role tertentu (seperti dropdown driver hanya untuk admin)

### Struktur Data Filter

\`\`\`typescript
interface FilterParams {
  dateFrom?: string  // Format: YYYY-MM-DD
  dateTo?: string    // Format: YYYY-MM-DD
  driverId?: string  // Hanya untuk admin
  location?: string  // Filter lokasi keberangkatan atau tujuan
}
\`\`\`

## Troubleshooting

Jika filter tidak bekerja sebagaimana mestinya:

1. **Pastikan tanggal dalam format yang benar** (YYYY-MM-DD)
2. **Periksa koneksi internet** jika dropdown driver tidak muncul
3. **Refresh halaman** jika data tidak terupdate setelah menerapkan filter
4. **Periksa console browser** untuk melihat error yang mungkin terjadi

## Pengembangan Lebih Lanjut

Untuk menambahkan filter baru:

1. Tambahkan field baru di komponen `ActivityFilter`
2. Update interface `FilterParams` sesuai dengan field baru
3. Tambahkan logika filter di API routes (`/api/admin/activities/route.ts` dan `/api/driver/activities/route.ts`)
4. Pastikan filter baru hanya muncul untuk role yang sesuai jika diperlukan
