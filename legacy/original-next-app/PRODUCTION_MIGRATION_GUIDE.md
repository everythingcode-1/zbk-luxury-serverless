# Production Migration Guide - Pemasangan Database di Production

## 🚀 Migration untuk Production (Coolify)

### Opsi 1: Menggunakan Prisma Migrate (Recommended)

Ini adalah cara yang **paling aman** untuk production karena:
- Menjaga history migration
- Bisa rollback jika ada masalah
- Track perubahan schema

#### Langkah-langkah:

**1. Buat Migration di Development (Lokal)**

```bash
# Generate Prisma Client
npm run db:generate

# Buat migration baru (akan membuat file di prisma/migrations/)
npm run db:migrate
# atau dengan nama spesifik:
npx prisma migrate dev --name add_hero_section
```

**2. Commit Migration Files ke Git**

```bash
git add prisma/migrations/
git commit -m "Add hero section migration"
git push
```

**3. Deploy ke Production (Coolify)**

Setelah deployment, jalankan migration di production:

```bash
# Via Coolify Terminal atau SSH ke server
npm run db:migrate:deploy
# atau
npx prisma migrate deploy
```

**Atau tambahkan ke Build Command di Coolify:**

Di Coolify, di bagian **Build Command**, tambahkan:

```bash
npm install && npm run db:generate && npm run db:migrate:deploy && npm run build
```

### Opsi 2: Menggunakan Prisma DB Push (Quick Setup)

**HATI-HATI**: Hanya untuk database baru atau development. Tidak disarankan untuk production yang sudah ada data.

```bash
# Generate Prisma Client
npm run db:generate

# Push schema langsung (tanpa migration history)
npm run db:push:production
# atau
npx prisma db push --accept-data-loss
```

### Opsi 3: Setup Database Baru dari Awal (Production)

Jika ini adalah database production yang baru dibuat:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema (membuat semua tabel)
npm run db:push

# 3. Seed data awal (opsional)
npm run db:seed
```

## 📋 Setup Database Production di Coolify

### Step 1: Konfigurasi Environment Variables

Di Coolify, pastikan `DATABASE_URL` sudah dikonfigurasi:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### Step 2: Build Command di Coolify

Di **Deployment Configuration** → **Build Command**, gunakan:

```bash
npm install && npm run db:generate && npm run db:migrate:deploy && npm run build
```

**Atau jika menggunakan db push:**

```bash
npm install && npm run db:generate && npm run db:push:production && npm run build
```

### Step 3: Run Command (Startup Command)

Di **Run Command**, gunakan:

```bash
npm start
```

### Step 4: Post-Deploy Script (Opsional)

Jika ingin menjalankan migration setelah deployment, tambahkan di **Post-Deploy Script**:

```bash
npm run db:migrate:deploy
```

## 🔧 Perintah-perintah Migration

### Development (Lokal)

```bash
# Generate Prisma Client
npm run db:generate

# Buat dan jalankan migration baru
npm run db:migrate

# Push schema langsung (tanpa migration)
npm run db:push
```

### Production

```bash
# Deploy migration yang sudah ada
npm run db:migrate:deploy
# atau
npx prisma migrate deploy

# Push schema (hati-hati, tidak ada history)
npm run db:push:production
# atau
npx prisma db push --accept-data-loss
```

### Setup Database Baru

```bash
# Full setup (generate + push + seed)
npm run db:setup:production
```

## 📝 Script yang Tersedia di package.json

| Script | Deskripsi | Kapan Digunakan |
|--------|-----------|-----------------|
| `db:generate` | Generate Prisma Client | Setiap kali schema berubah |
| `db:migrate` | Buat & jalankan migration baru | Development |
| `db:migrate:deploy` | Deploy migration ke production | **Production** |
| `db:push` | Push schema langsung | Development/Testing |
| `db:push:production` | Push schema dengan accept-data-loss | Production (hati-hati) |
| `db:setup:production` | Full setup (generate + push + seed) | Database baru |
| `db:seed` | Seed data awal | Setelah migration |

## ⚠️ Best Practices untuk Production

### ✅ DO (Lakukan)

1. **Selalu gunakan `prisma migrate deploy`** untuk production
2. **Test migration di staging** sebelum production
3. **Backup database** sebelum migration
4. **Commit migration files** ke Git
5. **Gunakan migration history** untuk tracking

### ❌ DON'T (Jangan)

1. **Jangan gunakan `db push`** di production yang sudah ada data
2. **Jangan skip migration files** - selalu commit ke Git
3. **Jangan jalankan migration manual** tanpa backup
4. **Jangan edit migration files** yang sudah di-deploy

## 🔍 Troubleshooting

### Error: "Migration failed"

```bash
# Cek status migration
npx prisma migrate status

# Reset migration (HATI-HATI - hanya untuk development)
npx prisma migrate reset
```

### Error: "Database connection failed"

1. Pastikan `DATABASE_URL` benar di Coolify
2. Pastikan database sudah dibuat
3. Pastikan user database punya permission
4. Test connection: `npm run test:db`

### Error: "Migration already applied"

```bash
# Cek migration status
npx prisma migrate status

# Jika perlu, mark migration sebagai applied
npx prisma migrate resolve --applied <migration_name>
```

## 📚 Contoh Workflow Lengkap

### Scenario: Menambahkan Hero Section ke Production

**1. Development (Lokal):**

```bash
# Edit prisma/schema.prisma (tambahkan HeroSection)
# Generate client
npm run db:generate

# Buat migration
npm run db:migrate
# Akan membuat: prisma/migrations/YYYYMMDDHHMMSS_add_hero_section/migration.sql

# Test migration
npm run db:migrate:deploy  # Test di local dulu
```

**2. Commit ke Git:**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "Add HeroSection model"
git push
```

**3. Production (Coolify):**

```bash
# Coolify akan otomatis:
# 1. Pull code dari Git
# 2. Run: npm install
# 3. Run: npm run db:generate (dari build command)
# 4. Run: npm run db:migrate:deploy (dari build command)
# 5. Run: npm run build
# 6. Run: npm start
```

## 🎯 Quick Reference

### Untuk Database Baru (Production)

```bash
npm run db:generate && npm run db:push && npm run db:seed
```

### Untuk Database Existing (Production)

```bash
npm run db:generate && npm run db:migrate:deploy
```

### Untuk Development

```bash
npm run db:generate && npm run db:migrate
```

---

**Catatan Penting:**
- Selalu backup database sebelum migration di production
- Test migration di staging terlebih dahulu
- Gunakan `migrate deploy` untuk production, bukan `db push`



