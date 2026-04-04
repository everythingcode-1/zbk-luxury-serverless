import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import {
  buildVehicleQuote,
  bookingHistoryQuerySchema,
  bookingHistoryResponseSchema,
  bookingLookupQuerySchema,
  bookingLookupResponseSchema,
  bookingQuoteRequestSchema,
  bookingRecordSchema,
  createBookingResponseSchema,
  createBookingSchema,
  healthResponseSchema,
  type BookingRecord,
  type Vehicle,
  vehicleSchema,
  vehiclesFilterSchema,
  vehiclesResponseSchema,
} from '@zbk/shared';

const app = new Hono();

const bookingDrafts: BookingRecord[] = [];
const paymentNextStep = 'Connect Workers-safe Stripe checkout session creation for this booking reference.';

function createBookingReference(date: Date) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${datePart}-${randomPart}`;
}

const vehicleCatalog: Vehicle[] = [
  vehicleSchema.parse({
    id: 'alphard-executive-lounge',
    name: 'Toyota Alphard Executive Lounge',
    model: 'Executive Lounge',
    category: 'Executive',
    year: 2024,
    status: 'AVAILABLE',
    location: 'Bali',
    capacity: 5,
    luggage: 4,
    color: 'Black',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Premium MPV for airport transfer, wedding, and executive trips.',
    features: ['Premium captain seats', 'Professional chauffeur', 'Airport meet & greet'],
    rating: 4.9,
    transmission: 'Automatic',
    isLuxury: true,
    services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'],
    minimumHours: 6,
    pricing: {
      airportTransfer: 80,
      sixHours: 360,
      twelveHours: 720,
      perHour: 75,
    },
  }),
  vehicleSchema.parse({
    id: 'mercedes-s-class',
    name: 'Mercedes-Benz S-Class',
    model: 'S 450 Luxury',
    category: 'Wedding',
    year: 2023,
    status: 'AVAILABLE',
    location: 'Jakarta',
    capacity: 3,
    luggage: 3,
    color: 'Obsidian Black',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Luxury sedan for VIP transfer and corporate hospitality.',
    features: ['Wedding convoy ready', 'VIP privacy cabin', 'Corporate hospitality setup'],
    rating: 4.8,
    transmission: 'Automatic',
    isLuxury: true,
    services: ['AIRPORT_TRANSFER', 'TRIP'],
    minimumHours: 1,
    pricing: {
      airportTransfer: 140,
      sixHours: 520,
      twelveHours: 980,
      perHour: 110,
    },
  }),
  vehicleSchema.parse({
    id: 'toyota-hiace-premio',
    name: 'Toyota HiAce Premio',
    model: 'Premio',
    category: 'Group',
    year: 2024,
    status: 'AVAILABLE',
    location: 'Bali',
    capacity: 10,
    luggage: 8,
    color: 'Pearl White',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Group transportation for tours, corporate teams, and event mobility.',
    features: ['10-passenger layout', 'Large luggage capacity', 'Event shuttle friendly'],
    rating: 4.7,
    transmission: 'Automatic',
    isLuxury: false,
    services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'],
    minimumHours: 6,
    pricing: {
      airportTransfer: 125,
      sixHours: 480,
      twelveHours: 900,
      perHour: 90,
    },
  }),
];

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.get('/', (c) => c.json({ service: 'zbk-luxury-api', status: 'ok' }));

app.get('/health', (c) =>
  c.json(
    healthResponseSchema.parse({
      status: 'ok',
      service: 'zbk-luxury-api',
      runtime: 'cloudflare-workers',
    }),
  ),
);

app.get('/api/public/vehicles', zValidator('query', vehiclesFilterSchema), (c) => {
  const query = c.req.valid('query');
  const categories = [...new Set(vehicleCatalog.map((vehicle) => vehicle.category))];

  const filtered = vehicleCatalog.filter((vehicle) => {
    if (query.status && vehicle.status !== query.status) return false;
    if (query.serviceType && !vehicle.services.includes(query.serviceType)) return false;
    if (query.category && vehicle.category !== query.category) return false;
    if (query.luxuryOnly && !vehicle.isLuxury) return false;
    return true;
  });

  const limited = query.limit ? filtered.slice(0, query.limit) : filtered;

  return c.json(
    vehiclesResponseSchema.parse({
      data: limited,
      filters: query,
      meta: {
        total: filtered.length,
        categories,
        source: 'seed-catalog',
      },
    }),
  );
});

app.get('/api/public/vehicles/:id', (c) => {
  const vehicle = vehicleCatalog.find((item) => item.id === c.req.param('id'));

  if (!vehicle) {
    return c.json({ message: 'Vehicle not found' }, 404);
  }

  return c.json({ data: vehicle });
});

app.post('/api/public/booking/quote', zValidator('json', bookingQuoteRequestSchema), async (c) => {
  const payload = c.req.valid('json');
  const vehicle = vehicleCatalog.find((item) => item.id === payload.vehicleId);

  if (!vehicle) {
    return c.json({ message: 'Vehicle not found' }, 404);
  }

  if (!vehicle.services.includes(payload.serviceType)) {
    return c.json({ message: 'Selected vehicle does not support this service type' }, 400);
  }

  const quote = buildVehicleQuote(vehicle, payload);
  return c.json({ data: quote });
});

app.get('/api/public/bookings', zValidator('query', bookingHistoryQuerySchema), (c) => {
  const { email } = c.req.valid('query');
  const normalizedEmail = email.trim().toLowerCase();
  const bookings = bookingDrafts.filter((item) => item.customerEmail.toLowerCase() === normalizedEmail);

  return c.json(
    bookingHistoryResponseSchema.parse({
      message: bookings.length
        ? 'Booking drafts found for this email. Latest draft appears first.'
        : 'No booking drafts found yet for this email.',
      data: bookings,
      meta: {
        total: bookings.length,
        pendingPayment: bookings.filter((item) => item.status === 'PENDING_PAYMENT').length,
      },
    }),
  );
});

app.post('/api/public/bookings', zValidator('json', createBookingSchema), async (c) => {
  const payload = c.req.valid('json');
  const vehicle = vehicleCatalog.find((item) => item.id === payload.vehicleId);

  if (!vehicle) {
    return c.json({ message: 'Vehicle not found' }, 404);
  }

  if (!vehicle.services.includes(payload.serviceType)) {
    return c.json({ message: 'Selected vehicle does not support this service type' }, 400);
  }

  const quote = buildVehicleQuote(vehicle, {
    vehicleId: payload.vehicleId,
    serviceType: payload.serviceType,
    hours: payload.hours,
    additionalHours: payload.additionalHours,
  });

  const createdAt = new Date();
  const bookingRecord = bookingRecordSchema.parse({
    id: crypto.randomUUID(),
    reference: createBookingReference(createdAt),
    status: 'PENDING_PAYMENT',
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    customerPhone: payload.customerPhone,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    serviceType: payload.serviceType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    pickupTime: payload.pickupTime,
    pickupLocation: payload.pickupLocation,
    pickupNote: payload.pickupNote,
    dropoffLocation: payload.dropoffLocation || payload.pickupLocation,
    dropoffNote: payload.dropoffNote,
    hours: payload.hours,
    additionalHours: payload.additionalHours,
    totalAmount: quote.totalAmount,
    depositAmount: quote.depositAmount,
    notes: payload.notes,
    createdAt: createdAt.toISOString(),
  });

  bookingDrafts.unshift(bookingRecord);

  return c.json(
    createBookingResponseSchema.parse({
      message: 'Booking draft captured. Stripe checkout belum dihubungkan, jadi status masih menunggu payment flow serverless.',
      data: bookingRecord,
      payment: {
        status: 'NOT_STARTED',
        nextStep: paymentNextStep,
      },
    }),
    202,
  );
});

app.get('/api/public/bookings/:reference', zValidator('query', bookingLookupQuerySchema), (c) => {
  const { email } = c.req.valid('query');
  const reference = c.req.param('reference').trim().toUpperCase();

  const bookingRecord = bookingDrafts.find(
    (item) => item.reference.toUpperCase() === reference && item.customerEmail.toLowerCase() === email.toLowerCase(),
  );

  if (!bookingRecord) {
    return c.json(
      {
        message: 'Booking reference not found for the supplied email.',
      },
      404,
    );
  }

  return c.json(
    bookingLookupResponseSchema.parse({
      message: 'Booking draft located. Status is still pending the serverless payment slice.',
      data: bookingRecord,
      payment: {
        status: 'NOT_STARTED',
        nextStep: paymentNextStep,
        checkoutReady: false,
      },
    }),
  );
});

app.post('/webhooks/stripe', async (c) => {
  const rawBody = await c.req.text();
  return c.json({
    message: 'Stripe webhook scaffold siap. Signature verification dan update booking belum diimplementasikan.',
    receivedBytes: rawBody.length,
  });
});

export default app;
