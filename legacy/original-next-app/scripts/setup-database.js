#!/usr/bin/env node

/**
 * ZBK Luxury Transport - Database Setup Script
 * Script untuk setup dan test database connection
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚗 ZBK Luxury Transport - Database Setup');
console.log('=========================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.log('❌ File .env.local tidak ditemukan!');
    console.log('📝 Silakan copy content dari env-config.txt ke .env.local\n');
    process.exit(1);
}

try {
    console.log('1️⃣ Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Prisma Client generated successfully!\n');

    console.log('2️⃣ Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Database schema pushed successfully!\n');

    console.log('3️⃣ Testing database connection...');
    
    // Test connection using our API
    const testConnection = async () => {
        try {
            // Import Prisma client
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            
            // Test connection
            await prisma.$connect();
            console.log('✅ Database connection successful!');
            
            // Get current stats
            const stats = {
                vehicles: await prisma.vehicle.count(),
                bookings: await prisma.booking.count(),
                blogPosts: await prisma.blogPost.count(),
                users: await prisma.user.count()
            };
            
            console.log('\n📊 Current Database Stats:');
            console.log(`   Vehicles: ${stats.vehicles}`);
            console.log(`   Bookings: ${stats.bookings}`);
            console.log(`   Blog Posts: ${stats.blogPosts}`);
            console.log(`   Users: ${stats.users}`);
            
            await prisma.$disconnect();
            
            if (stats.vehicles === 0 && stats.bookings === 0 && stats.blogPosts === 0) {
                console.log('\n💡 Database is empty. You can:');
                console.log('   - Run test data creation: npm run test:create-data');
                console.log('   - Use the testing suite: open test-data-insertion.html');
                console.log('   - Add data manually via admin dashboard');
            }
            
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            process.exit(1);
        }
    };
    
    testConnection();

} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}
