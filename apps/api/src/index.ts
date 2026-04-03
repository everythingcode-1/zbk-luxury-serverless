import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import {
  buildVehicleQuote,
  bookingQuoteRequestSchema,
  createBookingSchema,
  healthResponseSchema,
  type Vehicle,
  vehicleSchema,
  vehiclesFilterSchema,
  vehiclesResponseSchema,
} from '@zbk/shared';

const app = new Hono();

const vehicleCatalog: Vehicle[] = [
  vehicleSchema.parse({
    id: 'alphard-executive-lounge',
    name: 'Toyota Alphard Executive Lounge',
    model: 'Executive Lounge',
    year: 2024,
    status: 'AVAILABLE',
    location: 'Bali',
    capacity: 5,
    luggage: 4,
    color: 'Black',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    description: 'Premium MPV for airport transfer, wedding, and executive trips.',
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
    year: 2023,
    status: 'AVAILABLE',
    location: 'Jakarta',
    capacity: 3,
    luggage: 3,
    color: 'Obsidian Black',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    description: 'Luxury sedan for VIP transfer and corporate hospitality.',
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
    year: 2024,
    status: 'AVAILABLE',
    location: 'Bali',
    capacity: 10,
    luggage: 8,
    color: 'Pearl White',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    description: 'Group transportation for tours, corporate teams, and event mobility.',
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

  const filtered = vehicleCatalog.filter((vehicle) => {
    if (query.status && vehicle.status !== query.status) return false;
    if (query.serviceType && !vehicle.services.includes(query.serviceType)) return false;
    return true;
  });

  const limited = query.limit ? filtered.slice(0, query.limit) : filtered;

  return c.json(
    vehiclesResponseSchema.parse({
      data: limited,
      filters: query,
      meta: {
        total: filtered.length,
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

app.post('/api/public/bookings', zValidator('json', createBookingSchema), async (c) => {
  const payload = c.req.valid('json');
  const vehicle = vehicleCatalog.find((item) => item.id === payload.vehicleId);

  if (!vehicle) {
    return c.json({ message: 'Vehicle not found' }, 404);
  }

  return c.json(
    {
      message: 'Booking endpoint scaffold siap. Persist ke Neon + Stripe belum dihubungkan.',
      bookingDraft: payload,
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
      },
    },
    202,
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
