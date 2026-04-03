# 🌱 Database Seeding Guide - ZBK Limo

Complete guide untuk seeding database ZBK Limo dengan data lengkap.

## 📋 Apa yang Akan Di-seed?

Seeder lengkap ini akan membuat:

### 1. **Admin User** ✅
- **Email**: `zbklimo@gmail.com`
- **Password**: `Zbk2025!`
- **Role**: ADMIN
- **Access**: Full admin dashboard access

### 2. **Test Customer** ✅
- **Email**: `test@zbklimo.com`
- **Password**: `TestPass123!`
- **Status**: Email verified, Active
- **Purpose**: Testing customer features

### 3. **Vehicles dengan Carousel Order** ✅

| #  | Vehicle | Model | Passengers | Order | Price (Airport Transfer) |
|----|---------|-------|------------|-------|-------------------------|
| 1  | Toyota Alphard | ALPHARD | 6 + 4 luggage | 1️⃣ | SGD $80 |
| 2  | Toyota Noah | NOAH | 6 + 4 luggage | 2️⃣ | SGD $75 |
| 3  | Toyota Hiace Combi | HIACE | 9 + 8 luggage | 3️⃣ | SGD $90 |

**Urutan kendaraan** akan tampil sesuai `carouselOrder` di website:
- Alphard **pertama** (posisi #1)
- Noah **kedua** (posisi #2)  
- Combi **ketiga** (posisi #3)

### 4. **Blog Articles dengan SEO Lengkap** ✅

3 artikel profesional dalam bahasa Inggris:

1. **"Premium Car Rental in Singapore: Your Guide to Luxury Transport Services"**
   - SEO-optimized untuk keywords car rental Singapore
   - Komprehensif guide tentang premium car rental
   - Target: Tourists dan expats

2. **"Changi Airport Transfer Guide: Premium Transportation from Singapore Airport"**
   - Focus pada airport transfer services
   - Praktis guide untuk travelers
   - Target: Business travelers dan tourists

3. **"Luxury Car Rental Tips for Business Travelers in Singapore"**
   - Corporate-focused content
   - Productivity tips untuk executives
   - Target: Business professionals

**SEO Features**:
- Schema.org structured data (Organization, FAQPage, LocalBusiness)
- Meta descriptions optimized
- Keyword-rich content
- Internal linking structure
- Mobile-friendly formatting

---

## 🚀 Cara Menjalankan Seeder

### Option 1: Menggunakan Complete Seeder (Recommended)

```bash
# 1. Pastikan database connection sudah tersedia
# Check .env file: DATABASE_URL harus valid

# 2. Generate Prisma Client
npx prisma generate

# 3. Jalankan migration (jika belum)
npx prisma migrate dev

# 4. Run complete seeder
npx tsx prisma/seed-complete.ts
```

### Option 2: Step-by-Step Seeding

Jika ingin seed secara terpisah:

```bash
# 1. Seed basic data (admin + old vehicles)
node scripts/seed-basic.js

# 2. Seed updated vehicles with carousel order
npx tsx prisma/seed-vehicles.ts

# 3. Seed blog posts
node scripts/seed-blog.js

# 4. Seed test customers
node scripts/seed-test-customers.js
```

---

## ✅ Verifikasi Hasil Seeding

### 1. Check Admin Login
```
URL: http://localhost:3000/login/admin
Email: zbklimo@gmail.com
Password: Zbk2025!
```

### 2. Check Customer Login
```
URL: http://localhost:3000/login
Email: test@zbklimo.com
Password: TestPass123!
```

### 3. Check Vehicles
```bash
# Via Prisma Studio
npx prisma studio

# Or via database query
npx prisma db execute --stdin <<< "SELECT name, carouselOrder FROM vehicles ORDER BY carouselOrder;"
```

Output harus menunjukkan:
```
Alphard    | 1
Noah       | 2
Combi      | 3
```

### 4. Check Blog Posts
```bash
# Count articles
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM blog_posts WHERE isPublished = true;"
```

Harus menunjukkan: **3 articles**

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Solusi**:
1. Check apakah database server running
2. Verify DATABASE_URL di `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```
3. Test connection:
   ```bash
   npx prisma db pull
   ```

### Error: "carouselOrder does not exist"

**Solusi**:
1. Run migration untuk add carouselOrder field:
   ```bash
   npx prisma migrate dev --name add_carousel_order
   ```
2. Atau apply migration SQL manually:
   ```bash
   npx prisma db execute --file prisma/migrations/_add_carousel_order/migration.sql
   ```

### Error: "Unique constraint failed on plateNumber"

**Solusi**: Data sudah exist, clean dulu:
```bash
# Reset database (WARNING: Will delete ALL data)
npx prisma migrate reset --skip-seed

# Then run seeder again
npx tsx prisma/seed-complete.ts
```

### Error: "password hashing" atau bcrypt errors

**Solusi**:
```bash
# Install bcryptjs
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# Then run seeder again
npx tsx prisma/seed-complete.ts
```

---

## 📊 Database Schema Changes

Seeder ini memerlukan field `carouselOrder` di model Vehicle:

```prisma
model Vehicle {
  // ... other fields ...
  carouselOrder Int? // Optional carousel display order (1, 2, 3, etc.)
}
```

Jika field ini belum ada, run migration:
```bash
npx prisma migrate dev --name add_carousel_order_to_vehicle
```

---

## 🎯 SEO Implementation

### Structured Data yang Di-generate

1. **Organization Schema**
   - Company information
   - Contact details
   - Social media links

2. **LocalBusiness / AutoRental Schema**
   - Business type: Car Rental
   - Service area: Singapore
   - Operating hours: 24/7

3. **Product Schema** (per vehicle)
   - Vehicle details
   - Pricing information
   - Availability status
   - Features and amenities

4. **FAQPage Schema**
   - 8 common questions about car rental
   - Comprehensive answers
   - Search engine optimized

5. **Article Schema** (per blog post)
   - Author information
   - Published/modified dates
   - Featured images
   - Article content

### Cara Menggunakan SEO Schema

```typescript
// Di page atau component
import { organizationSchema, generateSEOTags } from '@/lib/seo-schema'

// Add to page metadata
export const metadata = generateSEOTags('home')

// Add schema.org JSON-LD
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(organizationSchema)
  }}
/>
```

---

## 📝 Next Steps Setelah Seeding

### 1. Update Contact Information
Edit `src/lib/seo-schema.ts`:
```typescript
"contactPoint": {
  "telephone": "+65-XXXX-XXXX", // Update with real number
  // ...
}
```

### 2. Upload Real Images
Replace placeholder images:
- `/4.-alphard-colors-black.png`
- `/vehicles/*.jpg`

### 3. Configure Social Media
Update social media links di:
- `src/lib/seo-schema.ts` (sameAs array)
- Footer component
- Contact page

### 4. Setup Email Service
Configure SMTP settings untuk:
- Booking confirmations
- Password resets
- Email verification

### 5. Test All Features
- [ ] Admin login works
- [ ] Customer registration works
- [ ] Vehicle carousel displays correctly (Alphard → Noah → Combi)
- [ ] Booking form works
- [ ] Blog articles render correctly
- [ ] SEO meta tags visible in page source

---

## 🔐 Security Notes

### Production Deployment

**IMPORTANT**: Sebelum deploy ke production:

1. **Change Default Passwords**:
   ```typescript
   // Update di seeder atau change via admin panel
   Admin: zbklimo@gmail.com -> NEW_SECURE_PASSWORD
   Test Customer: Disable or delete test account
   ```

2. **Remove Test Data**:
   ```sql
   DELETE FROM customers WHERE email = 'test@zbklimo.com';
   ```

3. **Secure Environment Variables**:
   ```env
   DATABASE_URL="postgresql://..."  # Use strong password
   JWT_SECRET="..."  # Generate secure random string
   STRIPE_SECRET_KEY="..."  # Use production keys
   ```

4. **Enable Rate Limiting**:
   - Protect API endpoints
   - Limit login attempts
   - Add CAPTCHA for forms

---

## 📞 Support

Jika ada masalah dengan seeding:

1. Check console output untuk error messages
2. Verify database connection
3. Ensure all dependencies installed: `npm install`
4. Check Prisma schema matches database: `npx prisma db pull`

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: ZBK Limo Development Team














