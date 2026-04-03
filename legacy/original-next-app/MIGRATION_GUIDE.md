# Migration Guide - Menjalankan Migration di Database Baru

## Menjalankan Semua Migration di Database Baru

Setelah menambahkan model `HeroSection` ke schema Prisma, ikuti langkah-langkah berikut untuk menjalankan migration:

### 1. Pastikan DATABASE_URL Sudah Dikonfigurasi

Pastikan file `.env` atau `.env.local` memiliki `DATABASE_URL` yang benar:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
# atau
npx prisma generate
```

### 3. Buat Migration Baru

Untuk membuat migration baru untuk model `HeroSection`:

```bash
npm run db:migrate
# atau
npx prisma migrate dev --name add_hero_section
```

Ini akan:
- Membuat file migration baru di `prisma/migrations/`
- Menjalankan migration ke database
- Generate Prisma Client

### 4. Deploy Migration ke Production (Coolify)

Untuk menjalankan migration di production/Coolify, gunakan:

```bash
npm run db:migrate:deploy
# atau
npx prisma migrate deploy
```

Atau jika menggunakan `db push` (untuk development/testing):

```bash
npm run db:push:production
# atau
npx prisma db push --accept-data-loss
```

### 5. Setup Database Baru dari Awal

Jika ini adalah database baru dan ingin setup semua dari awal:

```bash
# Generate client
npm run db:generate

# Push schema (membuat semua tabel)
npm run db:push

# Atau gunakan migrate
npm run db:migrate
```

### 6. Seed Data (Opsional)

Setelah migration selesai, jika ingin menambahkan data awal:

```bash
npm run db:seed
```

## Catatan Penting

- **Development**: Gunakan `prisma migrate dev` untuk membuat dan menjalankan migration
- **Production**: Gunakan `prisma migrate deploy` untuk menjalankan migration yang sudah ada
- **db push**: Hanya untuk development, tidak membuat file migration history

## Troubleshooting

Jika ada error saat migration:

1. Pastikan database connection string benar
2. Pastikan database sudah dibuat
3. Pastikan user database memiliki permission yang cukup
4. Untuk reset database (HATI-HATI, akan menghapus semua data):
   ```bash
   npm run db:reset
   ```




