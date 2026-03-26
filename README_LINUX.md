# Panduan Instalasi di Linux

Aplikasi ini adalah aplikasi full-stack yang menggunakan React (Vite) untuk frontend dan Express untuk backend, dengan SQLite sebagai database.

## Prasyarat
Pastikan sistem Linux Anda sudah terinstal:
1. **Node.js** (Versi 20 atau lebih baru direkomendasikan)
2. **npm** (Biasanya terinstal bersama Node.js)
3. **Build Tools** (Diperlukan untuk mengompilasi `better-sqlite3`)

### Cara Instalasi Prasyarat (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y nodejs npm build-essential
```

## Langkah-langkah Instalasi

### 1. Persiapkan Kode Sumber
Salin folder proyek ini ke direktori pilihan Anda di Linux.

### 2. Instal Dependensi
Buka terminal di dalam folder proyek dan jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan sesuaikan konfigurasinya jika diperlukan (misalnya `JWT_SECRET`).

### 4. Jalankan Aplikasi

#### Mode Pengembangan (Development)
Untuk menjalankan aplikasi dengan fitur hot-reload:
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

#### Mode Produksi (Production)
Untuk menjalankan aplikasi dengan performa maksimal:
1. Build frontend:
   ```bash
   npm run build
   ```
2. Jalankan server:
   ```bash
   npm run start
   ```

## Catatan Tambahan
- Database SQLite akan otomatis dibuat dengan nama `database.db` saat pertama kali dijalankan.
- Folder `uploads` akan digunakan untuk menyimpan file yang diunggah.
- Jika Anda menggunakan firewall (seperti `ufw`), pastikan port `3000` terbuka:
  ```bash
  sudo ufw allow 3000
  ```
