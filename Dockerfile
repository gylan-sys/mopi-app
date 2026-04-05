# Dockerfile untuk Full-Stack App (Express + Vite)
# Gunakan Node.js versi terbaru
FROM node:20-alpine

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi (termasuk devDependencies untuk build)
RUN npm install

# Salin semua file proyek (kecuali yang di .dockerignore)
COPY . .

# Build frontend (Vite)
RUN npx vite build

# Ekspos port 3000 (sesuai dengan server.ts)
EXPOSE 3000

# Set environment variable ke production untuk runtime
ENV NODE_ENV=production

# Jalankan aplikasi (menggunakan tsx untuk server.ts)
CMD ["npm", "start"]
