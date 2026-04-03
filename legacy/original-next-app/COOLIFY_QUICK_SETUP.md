# 🚀 Quick Setup Coolify - ZBK Limo

## ⚡ Setup Cepat (5 Menit)

### 1️⃣ Buat Database PostgreSQL di Coolify
- New Resource → Database → PostgreSQL
- Catat connection string

### 2️⃣ Setup Environment Variables

Tambahkan di Application Settings:

```env
# Database (dari PostgreSQL service)
DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require

# JWT & Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@your-domain.com

# Stripe (jika digunakan)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Environment
NODE_ENV=production
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

### 3️⃣ Build Command

```bash
npm install && npx prisma generate && npm run build
```

### 4️⃣ Start Command

```bash
npm start
```

### 5️⃣ Port

```
3000
```

### 6️⃣ Post-Deploy Command (Optional)

Untuk auto-run migrations setelah deploy:

```bash
npx prisma migrate deploy
```

---

## 🌱 Setup Database (Sekali Saja)

Setelah aplikasi pertama kali deploy, jalankan via Terminal di Coolify:

**Opsi 1: Menggunakan script otomatis (Recommended)**
```bash
npm run db:setup:production
```

**Opsi 2: Manual step by step**
```bash
# 1. Push schema ke database (membuat tabel)
npx prisma db push --accept-data-loss

# 2. Run seeder (sekali saja)
npm run db:seed
```

**Opsi 3: Menggunakan bash script**
```bash
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

> **Catatan:** Jika tidak ada migration files, gunakan `prisma db push` bukan `prisma migrate deploy`

---

## ✅ Checklist

- [ ] Database PostgreSQL dibuat
- [ ] DATABASE_URL di-set
- [ ] Semua env vars di-set
- [ ] Build command sudah benar
- [ ] Migrations dijalankan
- [ ] Seeder dijalankan (sekali)
- [ ] Aplikasi bisa diakses

---

## 📚 Dokumentasi Lengkap

Lihat `docs/COOLIFY_DEPLOYMENT.md` untuk panduan detail.

---

## 🆘 Troubleshooting

**Error: Prisma Client not generated**
→ Pastikan build command include `npx prisma generate`

**Error: Database connection failed**
→ Cek DATABASE_URL dan pastikan database service running

**Error: Migration failed / No migration found**
→ Gunakan `npx prisma db push --accept-data-loss` untuk membuat tabel dari schema

**Error: Seeder failed - table does not exist**
→ Pastikan schema sudah di-push ke database dengan `npx prisma db push --accept-data-loss`

**Error: File upload failed (500)**
→ Pastikan `ALLOW_FILE_SYSTEM_UPLOAD=true` di environment variables
→ Setup persistent volume di Coolify untuk folder `/app/public/uploads`

