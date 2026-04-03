# 📋 Panduan Lengkap Alur Pemesanan (Booking Flow)

## Daftar Isi
1. [Overview Sistem Booking](#overview-sistem-booking)
2. [Alur Pemesanan Step-by-Step](#alur-pemesanan-step-by-step)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Payment Integration (Stripe)](#payment-integration-stripe)
7. [Email Notifications](#email-notifications)
8. [Testing Guide](#testing-guide)

---

## Overview Sistem Booking

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Server-side)
- **Database**: PostgreSQL dengan Prisma ORM
- **Payment**: Stripe Checkout
- **Email**: Nodemailer
- **Deployment**: Vercel

### Fitur Utama
✅ Real-time vehicle availability check  
✅ Dynamic pricing calculation  
✅ Stripe payment integration  
✅ Email confirmation (customer & admin)  
✅ Booking management dashboard  
✅ Customer booking history  

---

## Alur Pemesanan Step-by-Step

### 🔄 **Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOOKING FLOW DIAGRAM                         │
└─────────────────────────────────────────────────────────────────┘

1. User Browse Fleet
   ↓
2. Select Vehicle & View Details
   ↓
3. Fill Booking Form
   │  - Personal Info (Name, Email, Phone)
   │  - Pickup Location & Date/Time
   │  - Dropoff Location & Date/Time
   │  - Number of Passengers
   │  - Special Requests (optional)
   ↓
4. Calculate Price
   │  - Base price from vehicle
   │  - Duration calculation
   │  - Additional charges
   ↓
5. Submit Booking (POST /api/booking)
   │  - Validate data
   │  - Check vehicle availability
   │  - Create booking record (status: PENDING)
   │  - Generate booking reference
   ↓
6. Redirect to Stripe Checkout
   │  - Create Stripe session
   │  - Pass booking metadata
   ↓
7. User Complete Payment
   ↓
8. Stripe Webhook Callback
   │  - Verify payment
   │  - Update booking status (CONFIRMED)
   │  - Send confirmation emails
   ↓
9. Redirect to Success Page
   │  - Show booking details
   │  - Display booking reference
   ↓
10. Admin Dashboard Update
    - New booking appears
    - Email notification sent
```

---

## Database Schema

### 📊 **Booking Model** (`prisma/schema.prisma`)

```prisma
model Booking {
  id                String   @id @default(cuid())
  
  // Customer Information
  customerName      String
  customerEmail     String
  customerPhone     String
  
  // Booking Details
  vehicleId         String
  vehicle           Vehicle  @relation(fields: [vehicleId], references: [id])
  
  pickupLocation    String
  pickupDate        DateTime
  pickupTime        String
  
  dropoffLocation   String
  dropoffDate       DateTime
  dropoffTime       String
  
  numberOfPassengers Int
  specialRequests   String?
  
  // Pricing
  totalPrice        Float
  
  // Status & Payment
  status            BookingStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  paymentIntentId   String?
  stripeSessionId   String?
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([customerEmail])
  @@index([status])
  @@index([vehicleId])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}
```

### 📊 **Vehicle Model**

```prisma
model Vehicle {
  id              String    @id @default(cuid())
  name            String
  type            String
  capacity        Int
  pricePerHour    Float
  pricePerDay     Float
  description     String
  features        String[]
  images          String[]
  isAvailable     Boolean   @default(true)
  bookings        Booking[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## API Endpoints

### 1️⃣ **GET /api/vehicles** - Fetch Available Vehicles

**Request:**
```typescript
GET /api/vehicles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "name": "Toyota Alphard",
      "type": "MPV",
      "capacity": 6,
      "pricePerHour": 50,
      "pricePerDay": 400,
      "description": "Luxury MPV with premium features",
      "features": ["Leather Seats", "WiFi", "USB Charging"],
      "images": ["/uploads/alphard.jpg"],
      "isAvailable": true
    }
  ]
}
```

**Code:** `src/app/api/vehicles/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vehicles'
    }, { status: 500 });
  }
}
```

---

### 2️⃣ **POST /api/booking** - Create New Booking

**Request:**
```typescript
POST /api/booking
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+65 9123 4567",
  "vehicleId": "clx123abc",
  "pickupLocation": "Changi Airport",
  "pickupDate": "2026-02-20",
  "pickupTime": "10:00",
  "dropoffLocation": "Marina Bay Sands",
  "dropoffDate": "2026-02-20",
  "dropoffTime": "18:00",
  "numberOfPassengers": 4,
  "specialRequests": "Need baby seat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "totalPrice": 400,
    "status": "PENDING",
    "createdAt": "2026-02-14T13:30:00.000Z"
  },
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Code:** `src/app/api/booking/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate vehicle exists and available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: body.vehicleId }
    });

    if (!vehicle || !vehicle.isAvailable) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle not available'
      }, { status: 400 });
    }

    // 2. Calculate total price
    const pickupDateTime = new Date(`${body.pickupDate}T${body.pickupTime}`);
    const dropoffDateTime = new Date(`${body.dropoffDate}T${body.dropoffTime}`);
    const durationHours = (dropoffDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = durationHours * vehicle.pricePerHour;

    // 3. Create booking record
    const booking = await prisma.booking.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        vehicleId: body.vehicleId,
        pickupLocation: body.pickupLocation,
        pickupDate: pickupDateTime,
        pickupTime: body.pickupTime,
        dropoffLocation: body.dropoffLocation,
        dropoffDate: dropoffDateTime,
        dropoffTime: body.dropoffTime,
        numberOfPassengers: body.numberOfPassengers,
        specialRequests: body.specialRequests,
        totalPrice: totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        vehicle: true
      }
    });

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sgd',
            product_data: {
              name: `${vehicle.name} Rental`,
              description: `${body.pickupLocation} to ${body.dropoffLocation}`,
              images: vehicle.images.length > 0 ? [
                `${process.env.NEXT_PUBLIC_BASE_URL}${vehicle.images[0]}`
              ] : []
            },
            unit_amount: Math.round(totalPrice * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking?cancelled=true`,
      customer_email: body.customerEmail,
      metadata: {
        bookingId: booking.id,
        vehicleId: vehicle.id,
        customerName: body.customerName
      }
    });

    // 5. Update booking with Stripe session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id }
    });

    return NextResponse.json({
      success: true,
      data: booking,
      checkoutUrl: session.url
    }, { status: 201 });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking'
    }, { status: 500 });
  }
}
```

---

### 3️⃣ **POST /api/stripe/webhook** - Handle Payment Success

**Code:** `src/app/api/stripe/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { sendBookingConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({
      error: 'Webhook signature verification failed'
    }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      // Update booking status
      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentIntentId: session.payment_intent as string
        },
        include: {
          vehicle: true
        }
      });

      // Send confirmation email
      await sendBookingConfirmation(booking);
    }
  }

  return NextResponse.json({ received: true });
}
```

---

### 4️⃣ **GET /api/customer/bookings** - Get Customer Bookings

**Request:**
```typescript
GET /api/customer/bookings?email=john@example.com
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx456def",
      "customerName": "John Doe",
      "vehicle": {
        "name": "Toyota Alphard",
        "images": ["/uploads/alphard.jpg"]
      },
      "pickupLocation": "Changi Airport",
      "pickupDate": "2026-02-20T10:00:00.000Z",
      "totalPrice": 400,
      "status": "CONFIRMED",
      "paymentStatus": "PAID"
    }
  ]
}
```

---

## Frontend Components

### 🎨 **Booking Form Component**

**File:** `src/components/organisms/BookingForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  vehicleId: string;
  vehicleName: string;
  pricePerHour: number;
}

export default function BookingForm({ 
  vehicleId, 
  vehicleName, 
  pricePerHour 
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupLocation: '',
    pickupDate: '',
    pickupTime: '',
    dropoffLocation: '',
    dropoffDate: '',
    dropoffTime: '',
    numberOfPassengers: 1,
    specialRequests: ''
  });

  const calculatePrice = () => {
    if (!formData.pickupDate || !formData.pickupTime || 
        !formData.dropoffDate || !formData.dropoffTime) {
      return 0;
    }

    const pickup = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    const dropoff = new Date(`${formData.dropoffDate}T${formData.dropoffTime}`);
    const hours = (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60);
    
    return hours * pricePerHour;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleId
        })
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculatePrice();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Booking Details</h2>
        
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Customer Information</h3>
          
          <input
            type="text"
            placeholder="Full Name"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.customerPhone}
            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Pickup Details */}
        <div className="space-y-4 mt-6">
          <h3 className="font-semibold text-lg">Pickup Details</h3>
          
          <input
            type="text"
            placeholder="Pickup Location"
            value={formData.pickupLocation}
            onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.pickupDate}
              onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
            
            <input
              type="time"
              value={formData.pickupTime}
              onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Dropoff Details */}
        <div className="space-y-4 mt-6">
          <h3 className="font-semibold text-lg">Dropoff Details</h3>
          
          <input
            type="text"
            placeholder="Dropoff Location"
            value={formData.dropoffLocation}
            onChange={(e) => setFormData({...formData, dropoffLocation: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.dropoffDate}
              onChange={(e) => setFormData({...formData, dropoffDate: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
            
            <input
              type="time"
              value={formData.dropoffTime}
              onChange={(e) => setFormData({...formData, dropoffTime: e.target.value})}
              required
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-4 mt-6">
          <input
            type="number"
            placeholder="Number of Passengers"
            value={formData.numberOfPassengers}
            onChange={(e) => setFormData({...formData, numberOfPassengers: parseInt(e.target.value)})}
            min="1"
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
          
          <textarea
            placeholder="Special Requests (Optional)"
            value={formData.specialRequests}
            onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Price Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Vehicle:</span>
            <span className="font-semibold">{vehicleName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Rate:</span>
            <span className="font-semibold">SGD ${pricePerHour}/hour</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t">
            <span>Total:</span>
            <span className="text-luxury-gold">SGD ${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || totalPrice === 0}
          className="w-full mt-6 bg-luxury-gold text-deep-navy px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </form>
  );
}
```

---

## Payment Integration (Stripe)

### 🔐 **Environment Variables**

**File:** `.env.local`
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 💳 **Stripe Checkout Flow**

1. **Create Checkout Session** (Backend)
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'sgd',
      product_data: {
        name: 'Toyota Alphard Rental',
        description: 'Changi Airport to Marina Bay Sands'
      },
      unit_amount: 40000 // SGD 400.00 in cents
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: 'https://yoursite.com/booking/confirmation?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yoursite.com/booking?cancelled=true',
  metadata: {
    bookingId: 'clx456def'
  }
});
```

2. **Redirect User to Stripe**
```typescript
window.location.href = session.url;
```

3. **Handle Webhook** (Update booking status)
```typescript
// Stripe sends webhook to /api/stripe/webhook
// Update booking status to CONFIRMED
// Send confirmation email
```

---

## Email Notifications

### 📧 **Email Service Setup**

**File:** `src/lib/email.ts`
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendBookingConfirmation(booking: any) {
  // Email to Customer
  await transporter.sendMail({
    from: '"ZBK Limousine" <noreply@zbktransportservices.com>',
    to: booking.customerEmail,
    subject: `Booking Confirmation - ${booking.vehicle.name}`,
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${booking.customerName},</p>
      <p>Your booking has been confirmed.</p>
      
      <h2>Booking Details:</h2>
      <ul>
        <li><strong>Vehicle:</strong> ${booking.vehicle.name}</li>
        <li><strong>Pickup:</strong> ${booking.pickupLocation} at ${booking.pickupDate}</li>
        <li><strong>Dropoff:</strong> ${booking.dropoffLocation} at ${booking.dropoffDate}</li>
        <li><strong>Total Price:</strong> SGD $${booking.totalPrice}</li>
      </ul>
      
      <p>Thank you for choosing ZBK Limousine!</p>
    `
  });

  // Email to Admin
  await transporter.sendMail({
    from: '"ZBK System" <noreply@zbktransportservices.com>',
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking - ${booking.vehicle.name}`,
    html: `
      <h1>New Booking Received</h1>
      <p>Booking ID: ${booking.id}</p>
      <p>Customer: ${booking.customerName} (${booking.customerEmail})</p>
      <p>Vehicle: ${booking.vehicle.name}</p>
      <p>Total: SGD $${booking.totalPrice}</p>
    `
  });
}
```

---

## Testing Guide

### 🧪 **Test Booking Flow**

#### **1. Test Data**
```json
{
  "customerName": "Test User",
  "customerEmail": "test@example.com",
  "customerPhone": "+65 9123 4567",
  "vehicleId": "clx123abc",
  "pickupLocation": "Changi Airport Terminal 1",
  "pickupDate": "2026-02-20",
  "pickupTime": "10:00",
  "dropoffLocation": "Marina Bay Sands",
  "dropoffDate": "2026-02-20",
  "dropoffTime": "18:00",
  "numberOfPassengers": 4,
  "specialRequests": "Need baby seat"
}
```

#### **2. Stripe Test Cards**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### **3. Test Steps**

**Step 1: Create Booking**
```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "+65 9123 4567",
    "vehicleId": "clx123abc",
    "pickupLocation": "Changi Airport",
    "pickupDate": "2026-02-20",
    "pickupTime": "10:00",
    "dropoffLocation": "Marina Bay Sands",
    "dropoffDate": "2026-02-20",
    "dropoffTime": "18:00",
    "numberOfPassengers": 4
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "status": "PENDING"
  },
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Step 2: Complete Payment**
- Open `checkoutUrl` in browser
- Use test card: `4242 4242 4242 4242`
- Complete checkout

**Step 3: Verify Webhook**
```bash
# Check booking status updated
curl http://localhost:3000/api/customer/bookings?email=test@example.com
```

**Expected:**
```json
{
  "success": true,
  "data": [{
    "id": "clx456def",
    "status": "CONFIRMED",
    "paymentStatus": "PAID"
  }]
}
```

---

## Common Issues & Solutions

### ❌ **Issue 1: Stripe Webhook Not Working**
**Solution:**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Get webhook signing secret
stripe listen --print-secret
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

### ❌ **Issue 2: Email Not Sending**
**Solution:**
- Check SMTP credentials in `.env.local`
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" for Gmail

### ❌ **Issue 3: Vehicle Not Available**
**Solution:**
```typescript
// Check vehicle availability before booking
const existingBookings = await prisma.booking.findMany({
  where: {
    vehicleId: vehicleId,
    status: { in: ['PENDING', 'CONFIRMED'] },
    OR: [
      {
        AND: [
          { pickupDate: { lte: dropoffDate } },
          { dropoffDate: { gte: pickupDate } }
        ]
      }
    ]
  }
});

if (existingBookings.length > 0) {
  throw new Error('Vehicle not available for selected dates');
}
```

---

## Summary Checklist

✅ **Database Setup**
- [ ] Prisma schema configured
- [ ] Database migrated
- [ ] Test vehicles created

✅ **API Endpoints**
- [ ] `/api/vehicles` - List vehicles
- [ ] `/api/booking` - Create booking
- [ ] `/api/stripe/webhook` - Handle payments
- [ ] `/api/customer/bookings` - Get bookings

✅ **Frontend**
- [ ] Booking form component
- [ ] Payment redirect
- [ ] Confirmation page

✅ **Payment Integration**
- [ ] Stripe keys configured
- [ ] Checkout session creation
- [ ] Webhook handling

✅ **Email Notifications**
- [ ] SMTP configured
- [ ] Customer confirmation email
- [ ] Admin notification email

✅ **Testing**
- [ ] Test booking creation
- [ ] Test payment flow
- [ ] Test webhook updates
- [ ] Test email delivery

---

## 📞 Support

Untuk pertanyaan atau bantuan:
- **Email**: support@zbktransportservices.com
- **Documentation**: `/docs/booking-flow`
- **API Reference**: `/docs/api`

---

**Last Updated**: February 14, 2026  
**Version**: 1.0.0
