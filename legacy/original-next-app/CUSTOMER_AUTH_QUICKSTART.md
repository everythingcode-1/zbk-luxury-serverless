# Customer Authentication - Quick Start Guide

## 🚀 Cara Cepat Mengaktifkan Customer Authentication

### Step 1: Install Dependencies

```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

> **Note:** We use `bcryptjs` (pure JavaScript) instead of `bcrypt` for better compatibility with deployment platforms like Vercel.

### Step 2: Update .env

Tambahkan ke file `.env`:

```env
# JWT Secret
JWT_SECRET=zbk-limo-customer-jwt-secret-2025-change-this
JWT_EXPIRES_IN=24h

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Migration

```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 4: Seed Test Customers

```bash
node scripts/seed-test-customers.js
```

### Step 5: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Test API Endpoints

### Test Registration (Postman/Thunder Client)

**POST** `http://localhost:3000/api/auth/customer/register`

```json
{
  "title": "MR",
  "firstName": "John",
  "lastName": "Test",
  "email": "johntest@example.com",
  "phoneNumber": "+1234567890",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

### Test Login

**POST** `http://localhost:3000/api/auth/customer/login`

```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

Response akan berisi:
- `customer` - Customer data
- `token` - JWT token
- `success: true`

---

## 📋 Test Accounts

| Email | Password | Title |
|-------|----------|-------|
| john.doe@example.com | Password123 | MR |
| jane.smith@example.com | Password123 | MS |
| sarah.johnson@example.com | Password123 | MRS |
| dr.brown@example.com | Password123 | DR |
| prof.davis@example.com | Password123 | PROF |

---

## 📂 Files Created

### Database & Types
- ✅ `prisma/schema.prisma` - Customer model added
- ✅ `prisma/migrations/add_customer_authentication/` - Migration files
- ✅ `src/types/customer.ts` - TypeScript types & interfaces

### Backend Logic
- ✅ `src/lib/customer-auth.ts` - Auth utilities (JWT, bcrypt, tokens)
- ✅ `src/lib/customer-email-templates.ts` - Email templates

### API Routes
- ✅ `src/app/api/auth/customer/register/route.ts` - Registration
- ✅ `src/app/api/auth/customer/login/route.ts` - Login

### Scripts & Docs
- ✅ `scripts/seed-test-customers.js` - Seeder
- ✅ `docs/CUSTOMER_AUTH_SYSTEM.md` - Full documentation
- ✅ `CUSTOMER_AUTH_IMPLEMENTATION.md` - Implementation summary

---

## 🎯 Next Steps (To Do)

### API Routes yang Perlu Dibuat:
1. Forgot Password
2. Reset Password  
3. Verify Email
4. Get Profile
5. Update Profile
6. Change Password

### Frontend yang Perlu Dibuat:
1. Registration Page (`/customer/register`)
2. Login Page (`/customer/login`)
3. Dashboard (`/customer/dashboard`)
4. Profile Page (`/customer/profile`)

### Integration:
1. Link booking ke customer saat login
2. Auto-fill booking form dengan customer data
3. Show booking history

---

## 🔧 Troubleshooting

### Migration Error?
```bash
# Try db push instead
npx prisma db push
npx prisma generate
```

### Module Not Found Error?
```bash
# Re-install dependencies
npm install
npx prisma generate
```

### JWT Error?
- Make sure `JWT_SECRET` is set in `.env`
- Restart dev server after adding env vars

---

## 📖 Full Documentation

Untuk detail lengkap, lihat:
- `docs/CUSTOMER_AUTH_SYSTEM.md` - Complete system documentation
- `CUSTOMER_AUTH_IMPLEMENTATION.md` - Implementation summary

---

**Status:** ✅ Schema & Core API Ready
**Test:** Use Postman/Thunder Client untuk test endpoints

















