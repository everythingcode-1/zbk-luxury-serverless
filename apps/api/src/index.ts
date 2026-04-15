import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { deleteCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { buildBlogArticleResponse, buildBlogArticlesResponse, buildBlogRssXml } from './blogArticles';
import {
  authLoginRequestSchema,
  authLogoutResponseSchema,
  authProfileUpdateRequestSchema,
  authProfileUpdateResponseSchema,
  authRegistrationRequestSchema,
  authRoleOptions,
  authTokenCookieName,
  authSessionResponseSchema,
  authSessionSchema,
  type AuthProfileUpdateRequest,
  getAuthSessionCapabilities,
  getAuthSessionPrimaryRoute,
  normalizeAuthSession,
  adminDashboardResponseSchema,
  authSessionStateResponseSchema,
  authUserSchema,
  buildVehicleQuote,
  bookingHistoryQuerySchema,
  bookingHistoryResponseSchema,
  bookingLookupQuerySchema,
  contactInquiryResponseSchema,
  contactInquirySchema,
  type ContactInquiry,
  bookingPaymentReturnQuerySchema,
  bookingPaymentReturnResponseSchema,
  bookingLookupResponseSchema,
  bookingQuoteRequestSchema,
  bookingRecordSchema,
  bookingPaymentStateSchema,
  calculateTripHours,
  createBookingResponseSchema,
  createBookingSchema,
  createCheckoutSessionResponseSchema,
  createCheckoutSessionSchema,
  deriveAdditionalHours,
  healthResponseSchema,
  inferServiceTypeFromTrip,
  type AuthLoginRequest,
  type AuthRegistrationRequest,
  type AuthSession,
  type AuthUser,
  type BookingPaymentState,
  type BookingRecord,
  type Vehicle,
  getVehicleCapacityBand,
  vehicleSchema,
  vehicleDetailResponseSchema,
  vehiclesFilterSchema,
  vehiclesResponseSchema,
} from '@zbk/shared';

type EnvBindings = {
  APP_NAME: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  WEB_APP_BASE_URL?: string;
};

const app = new Hono<{ Bindings: EnvBindings }>();

const bookingDrafts: BookingRecord[] = [];
const contactInquiries: Array<{
  reference: string;
  submittedAt: string;
  name: string;
  email: string;
  phone?: string;
  subject: ContactInquiry['subject'];
  message: string;
  messagePreview: string;
}> = [];
const bookingCheckoutSessions = new Map<string, {
  returnToken: string;
  sessionId: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt?: string;
  createdAt: string;
  webhookEventId?: string;
  webhookEventType?: string;
  paymentStatus?: BookingPaymentState['status'];
  paymentUpdatedAt?: string;
}>();
const bookingPaymentStates = new Map<string, BookingPaymentState>();
const defaultWebAppBaseUrl = 'http://localhost:5173';
const paymentNextStep = 'Create a Workers-safe Stripe checkout session for this booking reference.';

function buildDefaultPaymentState(env: EnvBindings): BookingPaymentState {
  const checkoutReady = hasStripeCheckoutConfigured(env);

  return {
    status: checkoutReady ? 'CHECKOUT_READY' : 'NOT_STARTED',
    checkoutReady,
    nextStep: checkoutReady
      ? 'Open Stripe checkout to collect the booking deposit and continue the migrated payment flow.'
      : paymentNextStep,
  };
}

function buildReturnPendingPaymentState(env: EnvBindings): BookingPaymentState {
  return {
    status: 'RETURN_PENDING_CONFIRMATION',
    checkoutReady: hasStripeCheckoutConfigured(env),
    nextStep: hasStripeCheckoutConfigured(env)
      ? 'Hosted checkout has been created. Waiting for the Stripe webhook to confirm the booking.'
      : 'Stripe return view is wired, but checkout still needs STRIPE_SECRET_KEY in the Worker environment.',
  };
}

function getBookingPaymentState(reference: string, env: EnvBindings, stage?: 'SUCCESS' | 'CANCEL') {
  const normalizedReference = reference.trim().toUpperCase();
  return bookingPaymentStates.get(normalizedReference) || (stage === 'SUCCESS' ? buildReturnPendingPaymentState(env) : buildDefaultPaymentState(env));
}

type BookingPaymentTrailUpdate = Pick<
  BookingRecord,
  'checkoutSessionId' | 'checkoutWebhookEventId' | 'checkoutWebhookEventType' | 'paymentTrailUpdatedAt'
>;

function setBookingPaymentState(reference: string, paymentState: BookingPaymentState) {
  const normalizedReference = reference.trim().toUpperCase();
  const parsed = bookingPaymentStateSchema.parse(paymentState);
  bookingPaymentStates.set(normalizedReference, parsed);
  return parsed;
}

function updateBookingRecordPaymentTrail(reference: string, trailUpdate: BookingPaymentTrailUpdate) {
  const normalizedReference = reference.trim().toUpperCase();
  const bookingRecord = bookingDrafts.find((item) => item.reference.toUpperCase() === normalizedReference);

  if (bookingRecord) {
    Object.assign(bookingRecord, trailUpdate);
  }

  return bookingRecord;
}

function syncBookingPaymentState(reference: string, paymentState: BookingPaymentState, trailUpdate: BookingPaymentTrailUpdate) {
  const parsed = setBookingPaymentState(reference, paymentState);
  updateBookingRecordPaymentTrail(reference, trailUpdate);
  return parsed;
}

function updateBookingRecordStatus(reference: string, status: BookingRecord['status']) {
  const normalizedReference = reference.trim().toUpperCase();
  const bookingRecord = bookingDrafts.find((item) => item.reference.toUpperCase() === normalizedReference);

  if (bookingRecord) {
    bookingRecord.status = status;
  }

  return bookingRecord;
}

function applyConfirmedBookingState(
  reference: string,
  paymentState: BookingPaymentState,
  status: BookingRecord['status'],
  trailUpdate: BookingPaymentTrailUpdate,
) {
  const parsed = syncBookingPaymentState(reference, paymentState, trailUpdate);
  updateBookingRecordStatus(reference, status);
  return parsed;
}

function createBookingReference(date: Date) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${datePart}-${randomPart}`;
}

function createContactReference(date: Date) {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `CT-${datePart}-${randomPart}`;
}

function buildContactMessagePreview(message: string) {
  const trimmed = message.trim().replace(/\s+/g, ' ');
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;
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

function getBookingsForCustomerEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return bookingDrafts.filter((item) => item.customerEmail.toLowerCase() === normalizedEmail);
}

function buildBookingHistoryResponse(bookings: BookingRecord[], message: string) {
  return bookingHistoryResponseSchema.parse({
    message,
    data: bookings,
    meta: {
      total: bookings.length,
      pendingPayment: bookings.filter((item) => item.status === 'PENDING_PAYMENT').length,
      confirmed: bookings.filter((item) => item.status === 'CONFIRMED').length,
      paymentFailed: bookings.filter((item) => item.status === 'PAYMENT_FAILED').length,
    },
  });
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

function matchesCapacityBand(capacity: number, capacityBand?: 'ALL' | 'COMPACT' | 'MID_SIZE' | 'GROUP') {
  if (!capacityBand || capacityBand === 'ALL') {
    return true;
  }

  return getVehicleCapacityBand(capacity) === capacityBand;
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

type AuthRole = (typeof authRoleOptions)[number];

type AuthAccount = AuthUser & {
  password: string;
};

const authSessionTtlMs = 1000 * 60 * 60 * 24 * 7;
const authAccounts = new Map<string, AuthAccount>([
  [
    'admin@zbk.local',
    {
      id: 'admin-zbk-demo',
      email: 'admin@zbk.local',
      displayName: 'Operations Admin',
      role: 'ADMIN',
      password: 'Admin123!',
    },
  ],
  [
    'customer@zbk.local',
    {
      id: 'customer-zbk-demo',
      email: 'customer@zbk.local',
      displayName: 'Demo Customer',
      role: 'CUSTOMER',
      password: 'Customer123!',
    },
  ],
]);
const authSessions = new Map<string, AuthSession>();

function getAuthCookieOptions(request: Request) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax' as const,
    secure: new URL(request.url).protocol === 'https:',
    maxAge: Math.floor(authSessionTtlMs / 1000),
  };
}

function setAuthSessionCookie(c: any, token: string) {
  setCookie(c, authTokenCookieName, token, getAuthCookieOptions(c.req.raw));
}

function clearAuthSessionCookie(c: any) {
  deleteCookie(c, authTokenCookieName, { path: '/' });
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createAuthToken() {
  return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
}

function createAuthSession(account: AuthAccount) {
  const now = new Date();
  const session = normalizeAuthSession(
    authSessionSchema.parse({
      token: createAuthToken(),
      status: 'ACTIVE',
      issuedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + authSessionTtlMs).toISOString(),
      user: authUserSchema.parse({
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        ...(account.phone ? { phone: account.phone } : {}),
      }),
      primaryRoute: getAuthSessionPrimaryRoute(account.role),
      capabilities: getAuthSessionCapabilities(account.role),
    }),
  );

  authSessions.set(session.token, session);
  return session;
}

function getAuthTokenFromRequest(request: Request) {
  const authorizationHeader = request.headers.get('authorization');
  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookieMatch = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/);
    if (cookieMatch) {
      return decodeURIComponent(cookieMatch[1]);
    }
  }

  const tokenHeader = request.headers.get('x-auth-token');
  return tokenHeader?.trim() || null;
}

function getActiveAuthSession(token?: string | null) {
  if (!token) return null;

  const session = authSessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    authSessions.delete(token);
    return null;
  }

  return session;
}

function createAuthResponse(message: string, session: AuthSession) {
  return authSessionResponseSchema.parse({
    message,
    data: { session },
  });
}

function createAuthSessionStateResponse(message: string, session: AuthSession | null) {
  return authSessionStateResponseSchema.parse({
    message,
    data: { session },
  });
}

function createAuthLogoutResponse(message: string) {
  return authLogoutResponseSchema.parse({
    message,
    data: { session: null },
  });
}

function authenticateAccount(email: string, password: string, expectedRole?: AuthRole) {
  const account = authAccounts.get(normalizeEmail(email));
  if (!account || account.password !== password) {
    throw new Error('Invalid email or password.');
  }

  if (expectedRole && account.role !== expectedRole) {
    throw new Error(`This endpoint is for ${expectedRole.toLowerCase()} accounts.`);
  }

  return account;
}

function registerCustomerAccount(payload: AuthRegistrationRequest) {
  const normalizedEmail = normalizeEmail(payload.email);
  if (authAccounts.has(normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const account: AuthAccount = {
    id: `customer-${crypto.randomUUID().slice(0, 8)}`,
    email: normalizedEmail,
    displayName: payload.displayName.trim(),
    role: 'CUSTOMER',
    password: payload.password,
    ...(payload.phone ? { phone: payload.phone.trim() } : {}),
  };

  authAccounts.set(normalizedEmail, account);
  return account;
}

function updateAuthAccountProfile(session: AuthSession, payload: AuthProfileUpdateRequest) {
  const currentEmail = normalizeEmail(session.user.email);
  const account = authAccounts.get(currentEmail);

  if (!account) {
    throw new Error('Current auth session could not be resolved.');
  }

  const nextEmail = payload.email ? normalizeEmail(payload.email) : currentEmail;
  if (nextEmail !== currentEmail && authAccounts.has(nextEmail)) {
    throw new Error('Email already exists.');
  }

  const nextDisplayName = payload.displayName?.trim() || account.displayName;
  const nextPhone = payload.phone?.trim();
  const nextAccount: AuthAccount = {
    ...account,
    email: nextEmail,
    displayName: nextDisplayName,
    ...(nextPhone ? { phone: nextPhone } : {}),
  };

  if (nextEmail !== currentEmail) {
    authAccounts.delete(currentEmail);
  }
  authAccounts.set(nextEmail, nextAccount);

  const updatedUser = authUserSchema.parse({
    id: account.id,
    email: nextEmail,
    displayName: nextDisplayName,
    role: account.role,
    ...(nextPhone ? { phone: nextPhone } : {}),
  });

  const updatedSession = normalizeAuthSession(
    authSessionSchema.parse({
      ...session,
      user: updatedUser,
      primaryRoute: getAuthSessionPrimaryRoute(account.role),
      capabilities: getAuthSessionCapabilities(account.role),
    }),
  );

  for (const [token, storedSession] of authSessions.entries()) {
    if (storedSession.user.id !== account.id) continue;
    authSessions.set(token, updatedSession);
  }

  return updatedSession;
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
  form.set('metadata[returnToken]', returnToken);
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

type StripeWebhookEvent = {
  id: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      client_reference_id?: string;
      metadata?: Record<string, string | undefined>;
      payment_status?: string;
      status?: string;
    };
  };
};

function parseStripeSignatureHeader(signatureHeader: string | null) {
  if (!signatureHeader) return null;

  const segments = signatureHeader.split(',').reduce<Record<string, string[]>>((acc, segment) => {
    const [rawKey, ...rawValueParts] = segment.trim().split('=');
    const key = rawKey?.trim();
    const value = rawValueParts.join('=').trim();

    if (!key || !value) return acc;

    acc[key] = acc[key] || [];
    acc[key].push(value);
    return acc;
  }, {});

  return {
    timestamp: segments.t?.[0] || null,
    signatures: segments.v1 || [],
  };
}

async function verifyStripeWebhookSignature(rawBody: string, signatureHeader: string | null, webhookSecret?: string) {
  const secret = webhookSecret?.trim();
  if (!secret) {
    return { mode: 'DEV_BYPASS' as const, verified: false };
  }

  const parsed = parseStripeSignatureHeader(signatureHeader);
  if (!parsed?.timestamp || !parsed.signatures.length) {
    throw new Error('Stripe signature header is missing or malformed.');
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${parsed.timestamp}.${rawBody}`));
  const expectedSignature = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  if (!parsed.signatures.includes(expectedSignature)) {
    throw new Error('Stripe webhook signature verification failed.');
  }

  return { mode: 'SIGNED' as const, verified: true };
}

function getStripeWebhookBookingReference(event: StripeWebhookEvent) {
  const object = event.data?.object;
  return object?.metadata?.bookingReference || object?.metadata?.reference || object?.client_reference_id || null;
}

function getStripeWebhookPaymentUpdate(eventType: string) {
  switch (eventType) {
    case 'checkout.session.completed':
      return {
        bookingStatus: 'CONFIRMED' as const,
        paymentState: {
          status: 'CONFIRMED' as const,
          checkoutReady: true,
          nextStep: 'Stripe webhook confirmed the payment and the booking is now marked as confirmed.',
        },
      };
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed':
      return {
        bookingStatus: 'PAYMENT_FAILED' as const,
        paymentState: {
          status: 'FAILED' as const,
          checkoutReady: true,
          nextStep: 'Stripe reported a payment failure. Customer can retry checkout from the booking record.',
        },
      };
    default:
      return null;
  }
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

function buildAdminDashboardPayload(session: AuthSession) {
  const categories = [...new Set(vehicleCatalog.map((vehicle) => vehicle.category))].map((category) => {
    const vehiclesInCategory = vehicleCatalog.filter((vehicle) => vehicle.category === category);
    return {
      category,
      totalVehicles: vehiclesInCategory.length,
      luxuryVehicles: vehiclesInCategory.filter((vehicle) => vehicle.isLuxury).length,
    };
  });

  const latestBookings = [...bookingDrafts].slice(-5).reverse();
  const adminSessions = [...authSessions.values()].filter((item) => item.user.role === 'ADMIN').length;
  const customerSessions = [...authSessions.values()].filter((item) => item.user.role === 'CUSTOMER').length;
  const contactInquiryCount = contactInquiries.length;

  return adminDashboardResponseSchema.parse({
    message: 'Admin dashboard loaded from the Workers runtime snapshot.',
    data: {
      generatedAt: new Date().toISOString(),
      sessionUser: session.user,
      summary: {
        totalVehicles: vehicleCatalog.length,
        availableVehicles: vehicleCatalog.filter((vehicle) => vehicle.status === 'AVAILABLE').length,
        totalBookings: bookingDrafts.length,
        pendingBookings: bookingDrafts.filter((booking) => booking.status === 'PENDING_PAYMENT').length,
        confirmedBookings: bookingDrafts.filter((booking) => booking.status === 'CONFIRMED').length,
        failedBookings: bookingDrafts.filter((booking) => booking.status === 'PAYMENT_FAILED').length,
        contactInquiries: contactInquiryCount,
        activeSessions: authSessions.size,
        adminSessions,
        customerSessions,
      },
      vehicleCategories: categories,
      latestBookings,
    },
  });
}

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

app.post('/api/auth/login', zValidator('json', authLoginRequestSchema), (c) => {
  const payload = c.req.valid('json');

  try {
    const account = authenticateAccount(payload.email, payload.password);
    const session = createAuthSession(account);

    setAuthSessionCookie(c, session.token);

    return c.json(
      createAuthResponse(`Signed in as ${account.displayName}.`, session),
      201,
    );
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Unable to sign in.',
      },
      401,
    );
  }
});

app.post('/api/auth/customer/login', zValidator('json', authLoginRequestSchema), (c) => {
  const payload = c.req.valid('json');

  try {
    const account = authenticateAccount(payload.email, payload.password, 'CUSTOMER');
    const session = createAuthSession(account);

    setAuthSessionCookie(c, session.token);

    return c.json(
      createAuthResponse(`Customer session created for ${account.displayName}.`, session),
      201,
    );
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Unable to sign in customer.',
      },
      401,
    );
  }
});

app.post('/api/auth/customer/register', zValidator('json', authRegistrationRequestSchema), (c) => {
  const payload = c.req.valid('json');

  try {
    const account = registerCustomerAccount(payload);
    const session = createAuthSession(account);

    setAuthSessionCookie(c, session.token);

    return c.json(
      createAuthResponse(`Customer account created for ${account.displayName}.`, session),
      201,
    );
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Unable to register customer.',
      },
      409,
    );
  }
});

app.get('/api/auth/me', (c) => {
  const token = getAuthTokenFromRequest(c.req.raw);
  const session = getActiveAuthSession(token);

  if (!session) {
    if (token) {
      clearAuthSessionCookie(c);
    }

    return c.json(
      createAuthSessionStateResponse('No active auth session found for this request.', null),
      401,
    );
  }

  setAuthSessionCookie(c, session.token);
  return c.json(createAuthSessionStateResponse('Active auth session resolved from Workers memory.', session));
});

app.patch('/api/auth/me', zValidator('json', authProfileUpdateRequestSchema), (c) => {
  const token = getAuthTokenFromRequest(c.req.raw);
  const session = getActiveAuthSession(token);

  if (!session) {
    if (token) {
      clearAuthSessionCookie(c);
    }

    return c.json(
      {
        message: 'Authentication required to update the profile.',
      },
      401,
    );
  }

  try {
    const updatedSession = updateAuthAccountProfile(session, c.req.valid('json'));
    setAuthSessionCookie(c, updatedSession.token);

    return c.json(
      authProfileUpdateResponseSchema.parse({
        message: `Updated the profile for ${updatedSession.user.displayName}.`,
        data: {
          session: updatedSession,
        },
      }),
    );
  } catch (error) {
    return c.json(
      {
        message: error instanceof Error ? error.message : 'Unable to update the profile.',
      },
      error instanceof Error && error.message === 'Email already exists.' ? 409 : 400,
    );
  }
});

app.post('/api/auth/logout', (c) => {
  const token = getAuthTokenFromRequest(c.req.raw);
  const session = getActiveAuthSession(token);

  if (token) {
    authSessions.delete(token);
    clearAuthSessionCookie(c);
  }

  return c.json(
    createAuthLogoutResponse(
      session
        ? `Signed out ${session.user.displayName}.`
        : 'No active auth session to sign out.',
    ),
  );
});

app.get('/api/customer/bookings', (c) => {
  const session = getActiveAuthSession(getAuthTokenFromRequest(c.req.raw));

  if (!session) {
    return c.json({ message: 'Authentication required to load customer bookings.' }, 401);
  }

  if (session.user.role !== 'CUSTOMER') {
    return c.json({ message: 'Customer bookings are available to customer sessions only.' }, 403);
  }

  setAuthSessionCookie(c, session.token);

  const bookings = getBookingsForCustomerEmail(session.user.email);
  return c.json(
    buildBookingHistoryResponse(
      bookings,
      bookings.length
        ? `Loaded ${session.user.displayName}'s authenticated booking history from Workers memory.`
        : 'No authenticated customer bookings found yet.',
    ),
  );
});

app.get('/api/admin/overview', (c) => {
  const session = getActiveAuthSession(getAuthTokenFromRequest(c.req.raw));

  if (!session) {
    return c.json({ message: 'Sign in as an admin to view the dashboard overview.' }, 401);
  }

  if (session.user.role !== 'ADMIN') {
    return c.json({ message: 'Admin dashboard access requires an ADMIN session.' }, 403);
  }

  return c.json(buildAdminDashboardPayload(session));
});

app.post('/api/public/contact', zValidator('json', contactInquirySchema), (c) => {
  const payload = c.req.valid('json');
  const now = new Date();
  const reference = createContactReference(now);
  const submittedAt = now.toISOString();
  const record = {
    reference,
    submittedAt,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    ...(payload.phone ? { phone: payload.phone.trim() } : {}),
    subject: payload.subject,
    message: payload.message.trim(),
    messagePreview: buildContactMessagePreview(payload.message),
  };

  contactInquiries.push(record);

  return c.json(
    contactInquiryResponseSchema.parse({
      message: 'Support inquiry accepted by the Workers-backed contact intake.',
      data: record,
    }),
    201,
  );
});

app.get('/api/public/vehicles', zValidator('query', vehiclesFilterSchema), (c) => {
  const query = c.req.valid('query');
  const categories = [...new Set(vehicleCatalog.map((vehicle) => vehicle.category))];

  const filtered = vehicleCatalog.filter((vehicle) => {
    if (query.status && vehicle.status !== query.status) return false;
    if (query.serviceType && !vehicle.services.includes(query.serviceType)) return false;
    if (query.category && vehicle.category !== query.category) return false;
    if (!matchesCapacityBand(vehicle.capacity, query.capacityBand)) return false;
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

  return c.json(
    vehicleDetailResponseSchema.parse({
      message: 'Vehicle detail loaded from the serverless seed catalog.',
      data: vehicle,
      meta: {
        imageCount: vehicle.images.length,
        source: 'seed-catalog',
        featuredFeature: vehicle.features[0],
      },
    }),
  );
});

app.get('/api/public/articles', (c) => {
  return c.json(buildBlogArticlesResponse());
});

app.get('/api/public/articles/:slug', (c) => {
  const slug = c.req.param('slug');
  const payload = buildBlogArticleResponse(slug);

  if (!payload) {
    return c.json({ message: 'Blog article not found' }, 404);
  }

  return c.json(payload);
});

app.get('/api/public/articles/rss.xml', (c) => {
  const baseUrl = resolveAppBaseUrl(c.env, c.req.header('origin') || undefined);
  const rss = buildBlogRssXml(baseUrl);

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
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
  const bookings = getBookingsForCustomerEmail(email);

  return c.json(
    buildBookingHistoryResponse(
      bookings,
      bookings.length
        ? 'Booking drafts found for this email. Latest draft appears first.'
        : 'No booking drafts found yet for this email.',
    ),
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
    paymentTrailUpdatedAt: createdAt.toISOString(),
  });

  bookingDrafts.unshift(bookingRecord);

  return c.json(
    createBookingResponseSchema.parse({
      message: 'Booking draft captured dengan trip-type logic legacy. Deposit checkout sekarang bisa diinisialisasi lewat Workers-safe Stripe handoff.',
      data: bookingRecord,
      payment: getBookingPaymentState(bookingRecord.reference, c.env),
    }),
    202,
  );
});

app.post('/api/public/bookings/:reference/checkout', zValidator('json', createCheckoutSessionSchema), async (c) => {
  const payload = c.req.valid('json');
  const reference = c.req.param('reference').trim().toUpperCase();
  const bookingRecord = getBookingByReference(reference, payload.email);
  const paymentState = getBookingPaymentState(bookingRecord?.reference || reference, c.env);

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
    const paymentTrailUpdatedAt = new Date().toISOString();
    const checkoutPaymentState = syncBookingPaymentState(
      bookingRecord.reference,
      {
        ...buildReturnPendingPaymentState(c.env),
        sessionId: session.sessionId,
        updatedAt: paymentTrailUpdatedAt,
      },
      {
        checkoutSessionId: session.sessionId,
        paymentTrailUpdatedAt,
      },
    );

    bookingCheckoutSessions.set(bookingRecord.reference, {
      returnToken,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      successUrl: session.successUrl,
      cancelUrl: session.cancelUrl,
      expiresAt: session.expiresAt,
      createdAt: paymentTrailUpdatedAt,
      paymentStatus: checkoutPaymentState.status,
      paymentUpdatedAt: paymentTrailUpdatedAt,
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
        payment: checkoutPaymentState,
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
  const paymentState = getBookingPaymentState(reference, c.env, query.stage);

  if (!bookingRecord || !checkoutSession || checkoutSession.returnToken !== query.token) {
    return c.json({ message: 'Payment return summary not found for this booking reference.' }, 404);
  }

  if (query.session_id && checkoutSession.sessionId !== query.session_id) {
    return c.json({ message: 'Payment return session does not match the latest checkout attempt for this booking.' }, 404);
  }

  return c.json(
    bookingPaymentReturnResponseSchema.parse({
      message: paymentState.status === 'CONFIRMED'
        ? 'Stripe webhook confirmed the checkout and the booking is now marked confirmed in Workers memory.'
        : paymentState.status === 'FAILED'
          ? 'Stripe webhook marked this checkout as failed, so the booking record is flagged for a retry.'
          : query.stage === 'SUCCESS'
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
      payment: paymentState,
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
      payment: getBookingPaymentState(bookingRecord.reference, c.env),
    }),
  );
});

async function handleStripeWebhook(c: any) {
  const rawBody = await c.req.text();
  const signatureHeader = c.req.header('stripe-signature');
  const verification = await verifyStripeWebhookSignature(rawBody, signatureHeader, c.env.STRIPE_WEBHOOK_SECRET);

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as StripeWebhookEvent;
  } catch {
    return c.json({ message: 'Stripe webhook payload is not valid JSON.' }, 400);
  }

  const bookingReference = getStripeWebhookBookingReference(event);
  if (!bookingReference) {
    return c.json({ message: 'Stripe webhook ignored because bookingReference metadata is missing.' }, 400);
  }

  const normalizedReference = bookingReference.trim().toUpperCase();
  const paymentUpdate = getStripeWebhookPaymentUpdate(event.type);
  const checkoutSession = bookingCheckoutSessions.get(normalizedReference);

  if (paymentUpdate) {
    const paymentTrailUpdatedAt = new Date().toISOString();
    applyConfirmedBookingState(
      normalizedReference,
      {
        ...paymentUpdate.paymentState,
        webhookEventId: event.id,
        webhookEventType: event.type,
        updatedAt: paymentTrailUpdatedAt,
      },
      paymentUpdate.bookingStatus,
      {
        checkoutWebhookEventId: event.id,
        checkoutWebhookEventType: event.type,
        paymentTrailUpdatedAt,
      },
    );
  }

  if (checkoutSession) {
    bookingCheckoutSessions.set(normalizedReference, {
      ...checkoutSession,
      webhookEventId: event.id,
      webhookEventType: event.type,
      paymentStatus: paymentUpdate?.paymentState.status || checkoutSession.paymentStatus,
      paymentUpdatedAt: new Date().toISOString(),
    });
  }

  const resolvedBooking = bookingDrafts.find((item) => item.reference.toUpperCase() === normalizedReference) || null;
  const resolvedPayment = getBookingPaymentState(normalizedReference, c.env);

  return c.json(
    {
      message: paymentUpdate
        ? verification.verified
          ? 'Stripe webhook verified and booking payment state updated in Workers memory.'
          : 'Stripe webhook parsed in development bypass mode and booking payment state updated.'
        : verification.verified
          ? 'Stripe webhook verified but the event type was not mapped to a booking state change.'
          : 'Stripe webhook parsed in development bypass mode, but the event type was not mapped to a booking state change.',
      data: {
        eventId: event.id,
        eventType: event.type,
        bookingReference: normalizedReference,
        bookingStatus: resolvedBooking?.status || 'UNKNOWN',
        verificationMode: verification.mode,
      },
      payment: resolvedPayment,
    },
    200,
  );
}

app.post('/webhooks/stripe', handleStripeWebhook);
app.post('/api/webhooks/stripe', handleStripeWebhook);

export default app;
