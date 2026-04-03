import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { bookingQuoteSchema, createBookingSchema, healthResponseSchema, vehiclesFilterSchema, computeBookingQuote } from '@zbk/shared';

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.get('/', (c) => c.json({ service: 'zbk-luxury-api', status: 'ok' }));

app.get('/health', (c) => c.json(healthResponseSchema.parse({
  status: 'ok',
  service: 'zbk-luxury-api',
  runtime: 'cloudflare-workers'
})));

app.get('/api/public/vehicles', zValidator('query', vehiclesFilterSchema), (c) => {
  const query = c.req.valid('query');
  return c.json({
    data: [],
    filters: query,
    message: 'Vehicle source belum dimigrasikan dari legacy app ke Neon.'
  });
});

app.post('/api/public/booking/quote', zValidator('json', bookingQuoteSchema), async (c) => {
  const payload = c.req.valid('json');
  const quote = computeBookingQuote(payload);
  return c.json({ data: quote });
});

app.post('/api/public/bookings', zValidator('json', createBookingSchema), async (c) => {
  const payload = c.req.valid('json');
  return c.json({
    message: 'Booking endpoint scaffold siap. Persist ke Neon + Stripe belum dihubungkan.',
    bookingDraft: payload,
  }, 202);
});

app.post('/webhooks/stripe', async (c) => {
  const rawBody = await c.req.text();
  return c.json({
    message: 'Stripe webhook scaffold siap. Signature verification dan update booking belum diimplementasikan.',
    receivedBytes: rawBody.length,
  });
});

export default app;
