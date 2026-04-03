# 🛡️ Safe Migration Guide - Add Pickup/Dropoff Notes

## ⚠️ IMPORTANT: Data Safety

**Migration ini AMAN dan tidak akan menghapus data yang ada!**
- ✅ Hanya menambahkan 2 kolom baru (pickupNote, dropoffNote)
- ✅ Kolom adalah nullable (optional), jadi tidak akan merusak data existing
- ✅ Tidak akan memodifikasi atau menghapus data yang sudah ada
- ✅ Backward compatible dengan aplikasi yang sudah ada

## 📋 SQL Migration yang Akan Dijalankan

```sql
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "pickupNote" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "dropoffNote" TEXT;
```

## 🚀 Cara Apply Migration (Pilih salah satu metode)

### Metode 1: Menggunakan Prisma Migrate (Recommended untuk Development)

```bash
# 1. Pastikan dev server sudah di-stop
# 2. Generate Prisma Client
npx prisma generate

# 3. Apply migration
npx prisma migrate dev --name add_pickup_dropoff_notes
```

### Metode 2: Manual SQL (Aman untuk Production)

Jika Anda ingin lebih yakin, bisa langsung jalankan SQL manual:

1. **Buka database console** (misalnya pgAdmin, DBeaver, atau psql)
2. **Connect ke database production** (pastikan backup sudah dibuat!)
3. **Jalankan SQL berikut:**

```sql
-- Add pickupNote column (nullable)
ALTER TABLE "bookings" 
ADD COLUMN IF NOT EXISTS "pickupNote" TEXT;

-- Add dropoffNote column (nullable)
ALTER TABLE "bookings" 
ADD COLUMN IF NOT EXISTS "dropoffNote" TEXT;
```

4. **Generate Prisma Client:**
```bash
npx prisma generate
```

### Metode 3: Menggunakan Prisma DB Push (Untuk Development/Staging)

```bash
# Pastikan dev server sudah di-stop
npx prisma db push
npx prisma generate
```

## 🔍 Verifikasi Migration

Setelah migration, verifikasi dengan query berikut:

```sql
-- Cek apakah kolom sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('pickupNote', 'dropoffNote');
```

Hasil yang diharapkan:
```
column_name  | data_type | is_nullable
-------------|-----------|-------------
pickupNote   | text      | YES
dropoffNote  | text      | YES
```

## 🔄 Untuk Production Deployment

### Sebelum Deploy:

1. **BACKUP DATABASE TERLEBIH DAHULU!**
   ```bash
   # Contoh backup PostgreSQL
   pg_dump -h your-host -U your-user -d your-database > backup_before_migration.sql
   ```

2. **Test di Staging Environment** terlebih dahulu

3. **Apply migration** menggunakan salah satu metode di atas

4. **Deploy code** yang baru

### Jika Menggunakan Prisma Migrate di Production:

```bash
# Di production server
npx prisma migrate deploy
```

## ✅ Checklist

- [ ] Backup database sudah dibuat
- [ ] Dev server sudah di-stop (untuk avoid EPERM error)
- [ ] Migration sudah di-test di staging
- [ ] Prisma Client sudah di-generate
- [ ] Code sudah di-deploy dengan schema baru
- [ ] Verifikasi kolom sudah muncul di database

## 🐛 Troubleshooting

### Error: EPERM (operation not permitted)
**Solusi:** Stop dev server terlebih dahulu sebelum generate Prisma client

### Error: Column already exists
**Solusi:** Migration sudah pernah dijalankan. Skip saja atau hapus IF NOT EXISTS jika ingin re-run

### Error: Relation does not exist
**Solusi:** Pastikan table "bookings" sudah ada di database

## 📞 Support

Jika ada masalah, cek:
- Prisma Docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Database connection string di .env
- Database permissions

---
**Last Updated:** 2025-01-XX
**Migration Type:** Safe Additive Migration (No Data Loss)







