# Implementasi Zona Waktu GMT+7 (Asia/Jakarta)

Dokumen ini menjelaskan implementasi zona waktu GMT+7 (Asia/Jakarta) dalam aplikasi Ambulan CitaSehat.

## Gambaran Umum

Aplikasi ini telah diimplementasikan untuk menggunakan zona waktu GMT+7 (Asia/Jakarta) secara konsisten di seluruh sistem, baik untuk tampilan maupun penyimpanan data.

## Fungsi Utilitas

Fungsi utilitas zona waktu telah dibuat dalam file `lib/timezone.ts`:

### 1. formatDisplayDate
Mengubah tanggal untuk ditampilkan kepada pengguna dengan format Indonesia menggunakan zona waktu GMT+7.

```typescript
formatDisplayDate(dateString: string): string
```

### 2. formatInputDate
Mengubah tanggal untuk input field HTML (YYYY-MM-DD) menggunakan zona waktu GMT+7.

```typescript
formatInputDate(dateValue: any): string
```

### 3. getCurrentDateInGMT7
Mendapatkan tanggal saat ini dalam format yang sesuai untuk input field menggunakan zona waktu GMT+7.

```typescript
getCurrentDateInGMT7(): string
```

## Implementasi di Berbagai Bagian

### 1. Tampilan Detail Aktivitas
Tanggal ditampilkan menggunakan fungsi `formatDisplayDate` yang menerapkan zona waktu GMT+7.

### 2. Formulir Edit Aktivitas
Tanggal diinput menggunakan fungsi `formatInputDate` yang memastikan konsistensi zona waktu GMT+7.

### 3. API dan Database
Penyimpanan tanggal dalam database dilakukan dengan mempertimbangkan zona waktu GMT+7 untuk memastikan konsistensi antara tampilan dan penyimpanan.

## Keuntungan Implementasi

1. **Konsistensi**: Semua tanggal ditampilkan dan disimpan secara konsisten menggunakan zona waktu GMT+7.
2. **Akurasi**: Menghindari perbedaan tanggal yang disebabkan oleh perbedaan zona waktu server dan klien.
3. **Pengalaman Pengguna**: Pengguna melihat tanggal yang sesuai dengan zona waktu lokal mereka (GMT+7).
4. **Pemeliharaan**: Fungsi utilitas terpusat memudahkan pemeliharaan dan pembaruan implementasi zona waktu.

## Pengujian

Implementasi telah diuji dengan skrip pengujian khusus untuk memastikan:
- Tanggal ditampilkan dengan benar dalam zona waktu GMT+7
- Tanggal diinput dengan benar menggunakan zona waktu GMT+7
- Konsistensi antara tampilan detail dan formulir edit

## Catatan Penting

- Semua fungsi terkait tanggal harus menggunakan fungsi utilitas yang telah disediakan
- Jangan menggunakan fungsi tanggal bawaan JavaScript tanpa mempertimbangkan zona waktu
- Pastikan semua implementasi baru mengikuti pola yang sudah ditetapkan