import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import {
  buildVehicleQuote,
  bookingHistoryQuerySchema,
  bookingHistoryResponseSchema,
  bookingLookupQuerySchema,
  bookingPaymentReturnQuerySchema,
  bookingPaymentReturnResponseSchema,
  bookingLookupResponseSchema,
  bookingQuoteRequestSchema,
  bookingRecordSchema,
  calculateTripHours,
  createBookingResponseSchema,
  createBookingSchema,
  createCheckoutSessionResponseSchema,
  createCheckoutSessionSchema,
  deriveAdditionalHours,
  healthResponseSchema,
  inferServiceTypeFromTrip,
  type BookingPaymentState,
  type BookingRecord,
  type Vehicle,
  vehicleSchema,
  vehiclesFilterSchema,
  vehiclesResponseSchema,
} from '@zbk/shared';

type EnvBindings = {
  APP_NAME: string;
  STRIPE_SECRET_KEY?: string;
  WEB_APP_BASE_URL?: string;
};

const app = new Hono<{ Bindings: EnvBindings }>();

const bookingDrafts: BookingRecord[] = [];
const bookingCheckoutSessions = new Map<string, {
  returnToken: string;
  sessionId: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt?: string;
  createdAt: string;
}>();
const defaultWebAppBaseUrl = 'http://localhost:5173';
const paymentNextStep = 'Create a Workers-safe Stripe checkout session for this booking reference.';

function createBookingReference(date: Date) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${datePart}-${randomPart}`;
}

function createReturnToken() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function hasStripeCheckoutConfigured(env: EnvBindings) {
  return Boolean(env.STRIPE_SECRET_KEY?.trim().startsWith('sk_'));
}

function buildPaymentState(env: EnvBindings): BookingPaymentState {
  const checkoutReady = hasStripeCheckoutConfigured(env);

  return {
    status: checkoutReady ? 'CHECKOUT_READY' : 'NOT_STARTED',
    checkoutReady,
    nextStep: checkoutReady
      ? 'Open Stripe checkout to collect the booking deposit and continue the migrated payment flow.'
      : paymentNextStep,
  };
}

function getBookingByReference(reference: string, email: string) {
  const normalizedReference = reference.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  return bookingDrafts.find(
    (item) => item.reference.toUpperCase() === normalizedReference && item.customerEmail.toLowerCase() === normalizedEmail,
  );
}

function resolveAppBaseUrl(env: EnvBindings, origin?: string) {
  const candidate = origin || env.WEB_APP_BASE_URL || defaultWebAppBaseUrl;

  try {
    const url = new URL(candidate);
    return `${url.protocol}//${url.host}`;
  } catch {
    return defaultWebAppBaseUrl;
  }
}

function buildPaymentReturnState(env: EnvBindings, stage: 'SUCCESS' | 'CANCEL'): BookingPaymentState {
  if (stage === 'SUCCESS') {
    return {
      status: hasStripeCheckoutConfigured(env) ? 'RETURN_PENDING_CONFIRMATION' : 'NOT_STARTED',
      checkoutReady: hasStripeCheckoutConfigured(env),
      nextStep: hasStripeCheckoutConfigured(env)
        ? 'Customer has landed on the migrated payment return view. Webhook verification and durable paid-state persistence are the next Stripe slice.'
        : 'Stripe return view is wired, but checkout still needs STRIPE_SECRET_KEY in the Worker environment.',
    };
  }

  return {
    status: hasStripeCheckoutConfigured(env) ? 'CHECKOUT_READY' : 'NOT_STARTED',
    checkoutReady: hasStripeCheckoutConfigured(env),
    nextStep: hasStripeCheckoutConfigured(env)
      ? 'Customer can reopen deposit checkout from this migrated cancel view when ready.'
      : paymentNextStep,
  };
}

async function createStripeCheckoutSession(
  env: EnvBindings,
  bookingRecord: BookingRecord,
  returnToken: string,
  origin?: string,
) {
  const secretKey = env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const baseUrl = resolveAppBaseUrl(env, origin);
  const successUrl = `${baseUrl}/#/payment/success?reference=${encodeURIComponent(bookingRecord.reference)}&token=${encodeURIComponent(returnToken)}&stage=SUCCESS&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/#/payment/cancel?reference=${encodeURIComponent(bookingRecord.reference)}&token=${encodeURIComponent(returnToken)}&stage=CANCEL`;
  const form = new URLSearchParams();

  form.set('mode', 'payment');
  form.set('success_url', successUrl);
  form.set('cancel_url', cancelUrl);
  form.set('customer_email', bookingRecord.customerEmail);
  form.set('payment_method_types[0]', 'card');
  form.set('metadata[bookingReference]', bookingRecord.reference);
  form.set('metadata[customerEmail]', bookingRecord.customerEmail);
  form.set('metadata[vehicleId]', bookingRecord.vehicleId);
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', 'sgd');
  form.set('line_items[0][price_data][unit_amount]', String(Math.round(bookingRecord.depositAmount * 100)));
  form.set('line_items[0][price_data][product_data][name]', `ZBK Luxury deposit ${bookingRecord.reference}`);
  form.set(
    'line_items[0][price_data][product_data][description]',
    `${bookingRecord.vehicleName} • ${bookingRecord.startDate}${bookingRecord.pickupTime ? ` ${bookingRecord.pickupTime}` : ''}`,
  );

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const payload = await response.json<{
    error?: { message?: string };
    id?: string;
    url?: string;
    expires_at?: number;
  }>();

  if (!response.ok || !payload.url || !payload.id) {
    throw new Error(payload.error?.message || `Stripe checkout session creation failed with status ${response.status}.`);
  }

  return {
    sessionId: payload.id,
    checkoutUrl: payload.url,
    successUrl,
    cancelUrl,
    expiresAt: payload.expires_at ? new Date(payload.expires_at * 1000).toISOString() : undefined,
  };
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

  const normalizedServiceType = inferServiceTypeFromTrip(
    payload.tripType,
    payload.pickupLocation,
    payload.dropoffLocation || payload.pickupLocation,
  );

  if (!vehicle.services.includes(normalizedServiceType)) {
    return c.json({ message: 'Selected vehicle does not support the inferred service type for this ride.' }, 400);
  }

  const normalizedHours = payload.tripType === 'ROUND_TRIP'
    ? calculateTripHours(payload.startDate, payload.pickupTime || '', payload.endDate, payload.endTime || '')
    : 1;

  if (payload.tripType === 'ROUND_TRIP' && !normalizedHours) {
    return c.json({ message: 'Round-trip bookings require a valid return date and return time after pickup.' }, 400);
  }

  const hours = normalizedHours || 1;
  const additionalHours = normalizedServiceType === 'RENTAL' ? deriveAdditionalHours(hours) : 0;

  const quote = buildVehicleQuote(vehicle, {
    vehicleId: payload.vehicleId,
    serviceType: normalizedServiceType,
    hours,
    additionalHours,
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
    tripType: payload.tripType,
    serviceType: normalizedServiceType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    pickupTime: payload.pickupTime,
    endTime: payload.endTime,
    pickupLocation: payload.pickupLocation,
    pickupNote: payload.pickupNote,
    dropoffLocation: payload.dropoffLocation || payload.pickupLocation,
    dropoffNote: payload.dropoffNote,
    hours,
    additionalHours,
    totalAmount: quote.totalAmount,
    depositAmount: quote.depositAmount,
    notes: payload.notes,
    createdAt: createdAt.toISOString(),
  });

  bookingDrafts.unshift(bookingRecord);

  return c.json(
    createBookingResponseSchema.parse({
      message: 'Booking draft captured dengan trip-type logic legacy. Deposit checkout sekarang bisa diinisialisasi lewat Workers-safe Stripe handoff.',
      data: bookingRecord,
      payment: buildPaymentState(c.env),
    }),
    202,
  );
});

app.post('/api/public/bookings/:reference/checkout', zValidator('json', createCheckoutSessionSchema), async (c) => {
  const payload = c.req.valid('json');
  const reference = c.req.param('reference').trim().toUpperCase();
  const bookingRecord = getBookingByReference(reference, payload.email);
  const paymentState = buildPaymentState(c.env);

  if (!bookingRecord) {
    return c.json({ message: 'Booking reference not found for the supplied email.' }, 404);
  }

  if (!paymentState.checkoutReady) {
    return c.json(
      createCheckoutSessionResponseSchema.parse({
        message: 'Stripe checkout contract is now wired for Workers, but STRIPE_SECRET_KEY is not configured in this environment yet.',
        data: {
          reference: bookingRecord.reference,
          mode: 'CONFIGURATION_REQUIRED',
          amountDue: bookingRecord.depositAmount,
          currency: 'sgd',
        },
        payment: paymentState,
      }),
      503,
    );
  }

  try {
    const returnToken = createReturnToken();
    const session = await createStripeCheckoutSession(c.env, bookingRecord, returnToken, payload.origin);

    bookingCheckoutSessions.set(bookingRecord.reference, {
      returnToken,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
      expiresAt: session.expiresAt,
      createdAt: new Date().toISOString(),
    });

    return c.json(
      createCheckoutSessionResponseSchema.parse({
        message: 'Stripe checkout session created. Customer can continue payment in the hosted checkout page.',
        data: {
          reference: bookingRecord.reference,
          mode: 'STRIPE',
          amountDue: bookingRecord.depositAmount,
          currency: 'sgd',
          checkoutUrl: session.checkoutUrl,
          sessionId: session.sessionId,
          successUrl: session.successUrl,
          cancelUrl: session.cancelUrl,
          expiresAt: session.expiresAt,
        },
        payment: paymentState,
      }),
      201,
    );
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Unable to create Stripe checkout session.',
      },
      502,
    );
  }
});

app.get('/api/public/bookings/:reference/payment-return', zValidator('query', bookingPaymentReturnQuerySchema), (c) => {
  const query = c.req.valid('query');
  const reference = c.req.param('reference').trim().toUpperCase();
  const bookingRecord = bookingDrafts.find((item) => item.reference.toUpperCase() === reference);
  const checkoutSession = bookingCheckoutSessions.get(reference);

  if (!bookingRecord || !checkoutSession || checkoutSession.returnToken !== query.token) {
    return c.json({ message: 'Payment return summary not found for this booking reference.' }, 404);
  }

  if (query.session_id && checkoutSession.sessionId !== query.session_id) {
    return c.json({ message: 'Payment return session does not match the latest checkout attempt for this booking.' }, 404);
  }

  return c.json(
    bookingPaymentReturnResponseSchema.parse({
      message: query.stage === 'SUCCESS'
        ? 'Stripe returned to the migrated success view. Webhook confirmation and durable payment persistence remain the next payment slice.'
        : 'Customer returned to the migrated cancel view and can safely reopen checkout from here.',
      data: {
        stage: query.stage,
        sessionId: checkoutSession.sessionId,
        successUrl: checkoutSession.successUrl,
        cancelUrl: checkoutSession.cancelUrl,
        checkoutUrl: checkoutSession.checkoutUrl,
        expiresAt: checkoutSession.expiresAt,
        booking: bookingRecord,
      },
      payment: buildPaymentReturnState(c.env, query.stage),
    }),
  );
});

app.get('/api/public/bookings/:reference', zValidator('query', bookingLookupQuerySchema), (c) => {
  const { email } = c.req.valid('query');
  const reference = c.req.param('reference').trim().toUpperCase();

  const bookingRecord = getBookingByReference(reference, email);

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
      message: 'Booking draft located. Payment handoff can now initialize Stripe checkout when the Worker secret is configured.',
      data: bookingRecord,
      payment: buildPaymentState(c.env),
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
