# Panduan Instalasi di CasaOS (Docker Compose)

Anda dapat menginstal aplikasi ini di CasaOS dengan sangat mudah menggunakan fitur **Custom Install** yang mendukung Docker Compose.

## Langkah-langkah Instalasi

### 1. Persiapan Folder
Pastikan Anda memiliki folder proyek di server CasaOS Anda (misalnya di `/DATA/AppData/coffee-pos`).

### 2. Konfigurasi Docker Compose
Buka dashboard CasaOS, klik ikon **App Store**, lalu pilih **Custom Install** (biasanya di pojok kanan atas).

Pilih opsi **Import** (ikon kertas dengan panah) dan tempelkan isi dari file `docker-compose.yml` yang telah disediakan.

### 3. Pengaturan Volume
Di bagian **Volumes**, pastikan path lokal di server CasaOS Anda mengarah ke folder yang benar:
- `/DATA/AppData/coffee-pos/database.db` -> `/app/database.db`
- `/DATA/AppData/coffee-pos/uploads` -> `/app/uploads`

### 4. Pengaturan Port
Aplikasi ini berjalan di port `3000`. Anda bisa memetakan port `3000` di container ke port `3000` (atau port lain yang tersedia) di host CasaOS.

### 5. Jalankan Aplikasi
Klik **Install** dan tunggu hingga proses build selesai. Setelah selesai, aplikasi akan muncul di dashboard CasaOS Anda.

---

## Saran untuk Pengembangan & Produksi

Berikut adalah beberapa saran untuk meningkatkan aplikasi Anda:

1.  **Keamanan JWT**: Jangan gunakan `JWT_SECRET` default. Selalu ganti dengan string acak yang panjang dan kuat di pengaturan environment Docker Compose.
2.  **Optimasi Produksi**: Saat ini server dijalankan menggunakan `tsx`. Untuk performa yang lebih baik di lingkungan produksi yang sibuk, disarankan untuk mengompilasi `server.ts` menjadi JavaScript murni menggunakan `esbuild` atau `tsc` sebelum dijalankan.
3.  **Backup Data**: Karena aplikasi menggunakan SQLite, pencadangan data sangat mudah. Cukup buat salinan file `database.db` secara berkala.
4.  **HTTPS/SSL**: Jika Anda mengakses aplikasi ini dari luar jaringan lokal, gunakan **Nginx Proxy Manager** (tersedia di App Store CasaOS) untuk menambahkan SSL (HTTPS) agar data transaksi aman.
5.  **Monitoring**: Gunakan fitur log di CasaOS untuk memantau jika ada error pada server atau aktivitas transaksi yang mencurigakan.
6.  **Validasi Input**: Pastikan semua input dari frontend divalidasi dengan ketat di sisi backend (server.ts) untuk mencegah serangan seperti SQL Injection atau Cross-Site Scripting (XSS).
