#!/bin/bash

# ==============================================================================
# SCRIPT OTOMATISASI UPDATE APLIKASI (CASAOS / VPS)
# ==============================================================================
# Gunakan skrip ini untuk menarik perubahan terbaru dari GitHub,
# menginstal dependensi, melakukan build, dan merestart aplikasi.

# 1. Masuk ke direktori aplikasi
# Ganti path di bawah ini jika lokasi aplikasi Anda berbeda
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "------------------------------------------"
echo "🚀 Memulai proses update di: $APP_DIR"
echo "------------------------------------------"

# 2. Tarik kode terbaru dari GitHub
echo "📥 Menarik kode terbaru dari GitHub..."
git pull origin main

# 3. Instal dependensi (jika ada perubahan package.json)
echo "📦 Menginstal dependensi baru..."
npm install

# 4. Build frontend (Vite)
echo "🏗️ Melakukan build frontend..."
npm run build

# 5. Restart aplikasi
# Opsi A: Jika menggunakan PM2 (Direkomendasikan)
if command -v pm2 &> /dev/null
then
    echo "🔄 Merestart aplikasi menggunakan PM2..."
    pm2 restart all || pm2 start server.ts --name "coffee-pos" --interpreter tsx
else
    # Opsi B: Jika menggunakan Docker Compose
    if [ -f "docker-compose.yml" ]; then
        echo "🐳 Merestart kontainer Docker..."
        sudo docker compose up --build -d
    else
        echo "⚠️ PM2 atau Docker tidak ditemukan."
        echo "💡 Silakan restart aplikasi Anda secara manual."
    fi
fi

echo "------------------------------------------"
echo "✅ Update selesai! Aplikasi Anda sudah diperbarui."
echo "------------------------------------------"
