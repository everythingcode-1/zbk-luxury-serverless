# Customer Authentication System

## Overview
Sistem autentikasi customer yang lengkap untuk ZBK Limo, memungkinkan customer untuk membuat akun, login, dan melakukan booking dengan profil mereka.

## Database Schema

### Customer Model

```prisma
model Customer {
  id                    String    @id @default(cuid())
  title                 Title     // Mr, Ms, Mrs, Dr, Prof
  firstName             String
  lastName              String
  email                 String    @unique
  phoneNumber           String
  password              String    // Hashed with bcrypt
  
  // Social Media (Optional)
  facebookHandle        String?
  instagramHandle       String?
  twitterHandle         String?
  linkedinHandle        String?
  
  // Password Reset
  resetPasswordToken    String?   @unique
  resetPasswordExpires  DateTime?
  
  // Email Verification
  isEmailVerified       Boolean   @default(false)
  emailVerificationToken String?  @unique
  
  // Account Status
  isActive              Boolean   @default(true)
  lastLoginAt           DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  // Relations
  bookings              Booking[]
}
```

### Title Enum

```prisma
enum Title {
  MR      // Mister
  MS      // Miss
  MRS     // Misses
  DR      // Doctor
  PROF    // Professor
}
```

### Booking Relation

Model `Booking` sekarang memiliki field `customerId` optional:
- Jika customer login: `customerId` diisi dengan ID customer
- Jika guest booking: `customerId` null, data disimpan di `customerName`, `customerEmail`, `customerPhone`

## Fitur

### 1. **Customer Registration**
- First name & last name
- Title (Mr/Ms/Mrs/Dr/Prof)
- Email (unique, untuk login)
- Phone number
- Password (hashed dengan bcrypt)
- Social media handles (optional)
- Email verification token dikirim ke email

### 2. **Customer Login**
- Login menggunakan email & password
- JWT token untuk session management
- Update `lastLoginAt` setiap login
- Validasi `isActive` dan `isEmailVerified`

### 3. **Password Reset**
- Generate `resetPasswordToken` (unique, random)
- Set `resetPasswordExpires` (contoh: 1 jam dari sekarang)
- Kirim email dengan link reset password
- Validasi token dan expiry saat reset
- Hash password baru dan clear reset fields

### 4. **Email Verification**
- Generate `emailVerificationToken` saat register
- Kirim email verifikasi
- Validasi token dan set `isEmailVerified = true`

### 5. **Profile Management**
- Update profile (nama, phone, social media)
- Change password
- View booking history

### 6. **Booking Integration**
- Logged-in customer: booking otomatis link ke customer ID
- Guest booking: tetap bisa booking tanpa login
- Customer bisa lihat semua booking mereka di profile

## API Endpoints (To Be Implemented)

### Authentication
- `POST /api/auth/customer/register` - Customer registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/customer/logout` - Customer logout
- `GET /api/auth/customer/me` - Get current customer profile

### Password Management
- `POST /api/auth/customer/forgot-password` - Request password reset
- `POST /api/auth/customer/reset-password` - Reset password with token
- `POST /api/auth/customer/change-password` - Change password (logged in)

### Email Verification
- `POST /api/auth/customer/verify-email` - Verify email with token
- `POST /api/auth/customer/resend-verification` - Resend verification email

### Profile
- `GET /api/customer/profile` - Get profile
- `PUT /api/customer/profile` - Update profile
- `GET /api/customer/bookings` - Get booking history

## Security Features

### Password Security
- Bcrypt hashing dengan salt rounds: 10
- Minimum password length: 8 characters
- Password complexity requirements (optional)

### Token Security
- JWT with expiry (contoh: 24 hours)
- Secure token generation untuk reset password
- Token expiry validation
- One-time use tokens

### Email Verification
- Email harus diverifikasi untuk booking (optional)
- Resend verification email option
- Token expiry untuk verification

### Account Security
- `isActive` flag untuk disable account
- Rate limiting untuk login attempts
- Password change requires current password

## Database Migration

### Create Migration

```bash
npx prisma migrate dev --name add_customer_model
```

### Push to Database

```bash
npx prisma db push
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Implementation Steps

### Step 1: Run Migration
```bash
cd c:\Users\HP\OneDrive\Dokumen\Program\rbklux\zbk
npx prisma migrate dev --name add_customer_authentication
npx prisma generate
```

### Step 2: Create API Routes
- Customer registration endpoint
- Customer login endpoint
- Password reset endpoints
- Email verification endpoints
- Profile management endpoints

### Step 3: Create Middleware
- JWT authentication middleware untuk customer
- Email verification check middleware
- Rate limiting middleware

### Step 4: Update Booking Flow
- Detect jika customer logged in
- Auto-fill booking form dengan customer data
- Link booking ke customer ID

### Step 5: Create Customer Portal
- Customer dashboard page
- Profile management page
- Booking history page
- Password change page

### Step 6: Email Templates
- Welcome email
- Email verification email
- Password reset email
- Booking confirmation email (with customer name)

## Example Usage

### Customer Registration

```typescript
// POST /api/auth/customer/register
{
  "title": "MR",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123",
  "facebookHandle": "johndoe",
  "instagramHandle": "johndoe"
}
```

### Customer Login

```typescript
// POST /api/auth/customer/login
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}

// Response
{
  "success": true,
  "customer": {
    "id": "cuid...",
    "title": "MR",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": true
  },
  "token": "jwt_token_here"
}
```

### Forgot Password

```typescript
// POST /api/auth/customer/forgot-password
{
  "email": "john.doe@example.com"
}

// Email sent with reset link:
// https://zbklimo.com/reset-password?token=random_secure_token
```

### Reset Password

```typescript
// POST /api/auth/customer/reset-password
{
  "token": "random_secure_token",
  "newPassword": "NewSecurePassword123"
}
```

### Create Booking (Logged In)

```typescript
// Booking dengan customer login
{
  "customerId": "cuid...",  // Auto-filled from JWT
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "customerPhone": "+1234567890",
  "vehicleId": "...",
  // ... other booking fields
}
```

## Benefits

### For Customers
- ✅ No need to re-enter details for each booking
- ✅ View booking history
- ✅ Manage profile & preferences
- ✅ Secure password reset
- ✅ Email verification untuk keamanan

### For Business
- ✅ Customer database untuk marketing
- ✅ Customer loyalty tracking
- ✅ Better customer insights
- ✅ Repeat customer identification
- ✅ Personalized communication

## Migration Notes

⚠️ **Important:**
- Existing bookings tidak akan memiliki `customerId` (akan null)
- Guest booking tetap supported (customerId optional)
- Backward compatibility terjaga dengan field `customerName`, `customerEmail`, `customerPhone`

## Next Steps

1. ✅ Schema created
2. ⏳ Run migration
3. ⏳ Create API endpoints
4. ⏳ Create customer middleware
5. ⏳ Update booking flow
6. ⏳ Create customer portal UI
7. ⏳ Create email templates
8. ⏳ Testing

---

**Created:** December 16, 2025
**Status:** Schema Ready - Implementation Pending

















