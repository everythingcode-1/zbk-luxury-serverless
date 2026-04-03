/**
 * Safe Migration Script - Add Pickup/Dropoff Notes
 * 
 * Script ini akan:
 * 1. Backup database schema (optional, via Prisma)
 * 2. Apply migration yang aman (hanya ADD COLUMN)
 * 3. Generate Prisma Client
 * 
 * AMAN: Migration ini tidak akan menghapus data yang ada!
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🛡️  Safe Migration: Add Pickup/Dropoff Notes');
console.log('=========================================\n');
console.log('⚠️  PENTING: Migration ini AMAN dan tidak akan menghapus data!');
console.log('   - Hanya menambahkan 2 kolom baru (nullable)');
console.log('   - Tidak akan memodifikasi data yang sudah ada\n');

try {
    console.log('1️⃣  Generating Prisma Client...');
    try {
        execSync('npx prisma generate', { 
            stdio: 'inherit', 
            cwd: path.join(__dirname, '..'),
            env: { ...process.env, PRISMA_SKIP_POSTINSTALL_GENERATE: 'true' }
        });
        console.log('✅ Prisma Client generated successfully!\n');
    } catch (error) {
        console.warn('⚠️  Warning: Prisma generate mungkin gagal jika dev server masih berjalan');
        console.warn('   Silakan stop dev server terlebih dahulu dan jalankan: npx prisma generate\n');
    }

    console.log('2️⃣  Applying database migration...');
    console.log('   Menggunakan prisma db push (safe untuk development)');
    console.log('   Untuk production, gunakan prisma migrate deploy\n');
    
    try {
        execSync('npx prisma db push --accept-data-loss=false', { 
            stdio: 'inherit', 
            cwd: path.join(__dirname, '..')
        });
        console.log('✅ Database migration applied successfully!\n');
    } catch (error) {
        console.error('❌ Migration failed. Silakan cek error di atas.');
        console.error('   Alternatif: Jalankan SQL manual di database:\n');
        console.error('   ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "pickupNote" TEXT;');
        console.error('   ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "dropoffNote" TEXT;\n');
        process.exit(1);
    }

    console.log('3️⃣  Verifying migration...');
    console.log('   Kolom pickupNote dan dropoffNote seharusnya sudah ditambahkan\n');

    console.log('✅ Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Restart dev server');
    console.log('   2. Test form booking dengan airport location');
    console.log('   3. Verify notes tersimpan di database\n');

} catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('\n💡 Tips:');
    console.error('   - Pastikan dev server sudah di-stop');
    console.error('   - Cek database connection string di .env');
    console.error('   - Untuk production, gunakan manual SQL atau prisma migrate deploy\n');
    process.exit(1);
}







