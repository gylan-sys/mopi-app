# Dockerfile untuk Full-Stack App (Express + Vite)
# Gunakan Node.js versi terbaru
FROM node:20-alpine

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi
RUN npm install

# Salin semua file proyek
COPY . .

# Build frontend (Vite)
RUN npm run build

# Ekspos port 3000 (sesuai dengan server.ts)
EXPOSE 3000

# Jalankan aplikasi (menggunakan tsx untuk server.ts)
CMD ["npm", "start"]
