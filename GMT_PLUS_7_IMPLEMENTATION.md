# Implementasi Zona Waktu GMT+7 (Asia/Jakarta)

Dokumen ini menjelaskan implementasi zona waktu GMT+7 (Asia/Jakarta) dalam aplikasi Ambulan CitaSehat.

## Gambaran Umum

Aplikasi ini telah diimplementasikan untuk menggunakan zona waktu GMT+7 (Asia/Jakarta) secara konsisten di seluruh sistem, baik untuk tampilan maupun penyimpanan data. Implementasi ini tidak bergantung pada variabel lingkungan `TZ` karena tidak didukung oleh Vercel, melainkan menggunakan fungsi JavaScript bawaan untuk penanganan zona waktu.

## Fungsi Utilitas

Fungsi utilitas zona waktu telah dibuat dalam file [lib/timezone.ts](file:///c:/laragon/www/Ambulan-CitaSehat/lib/timezone.ts):

### 1. formatDisplayDate
Mengubah tanggal untuk ditampilkan kepada pengguna dengan format Indonesia menggunakan zona waktu GMT+7.

\`\`\`typescript
formatDisplayDate(dateString: string): string
\`\`\`

### 2. formatInputDate
Mengubah tanggal untuk input field HTML (YYYY-MM-DD) menggunakan zona waktu GMT+7.

\`\`\`typescript
formatInputDate(dateValue: any): string
\`\`\`

### 3. getCurrentDateInGMT7
Mendapatkan tanggal saat ini dalam format yang sesuai untuk input field menggunakan zona waktu GMT+7.

\`\`\`typescript
getCurrentDateInGMT7(): string
\`\`\`

## Implementasi di Berbagai Bagian

### 1. Tampilan Detail Aktivitas
Tanggal ditampilkan menggunakan fungsi [formatDisplayDate](file:///c:/laragon/www/Ambulan-CitaSehat/lib/timezone.ts#L7-L15) yang menerapkan zona waktu GMT+7.

### 2. Formulir Edit Aktivitas
Tanggal diinput menggunakan fungsi [formatInputDate](file:///c:/laragon/www/Ambulan-CitaSehat/lib/timezone.ts#L18-L45) yang memastikan konsistensi zona waktu GMT+7.

### 3. API dan Database
Penyimpanan tanggal dalam database dilakukan dengan mempertimbangkan zona waktu GMT+7 untuk memastikan konsistensi antara tampilan dan penyimpanan.

## Kompatibilitas Vercel

Implementasi zona waktu ini kompatibel dengan Vercel karena:
1. Tidak bergantung pada variabel lingkungan `TZ` yang tidak didukung oleh Vercel
2. Menggunakan fungsi JavaScript bawaan untuk penanganan zona waktu
3. Menyediakan fallback yang sesuai jika variabel lingkungan tidak tersedia

## Konfigurasi Lingkungan

Aplikasi menggunakan pendekatan berikut untuk konfigurasi zona waktu:
- Konstanta [TIMEZONE](file:///c:/laragon/www/Ambulan-CitaSehat/lib/config.ts#L45-L45) di [lib/config.ts](file:///c:/laragon/www/Ambulan-CitaSehat/lib/config.ts) dengan fallback ke 'Asia/Jakarta'
- Fungsi utilitas zona waktu yang mengatur zona waktu secara eksplisit
- Tidak bergantung pada konfigurasi sistem tingkat atas
