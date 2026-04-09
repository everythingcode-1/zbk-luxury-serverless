import { z } from 'zod';

export const serviceTypeOptions = ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'] as const;
export const vehicleStatusOptions = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED'] as const;
export const vehicleCategoryOptions = ['Executive', 'Wedding', 'Group'] as const;
export const tripTypeOptions = ['ONE_WAY', 'ROUND_TRIP'] as const;

export const serviceTypeSchema = z.enum(serviceTypeOptions);
export const vehicleStatusSchema = z.enum(vehicleStatusOptions);
export const vehicleCategorySchema = z.enum(vehicleCategoryOptions);
export const tripTypeSchema = z.enum(tripTypeOptions);

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  category: vehicleCategorySchema,
  year: z.number().int(),
  status: vehicleStatusSchema,
  location: z.string(),
  capacity: z.number().int().positive(),
  luggage: z.number().int().nonnegative().nullable().optional(),
  color: z.string(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string()).default([]),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
  transmission: z.string().optional(),
  isLuxury: z.boolean().optional(),
  services: z.array(serviceTypeSchema).min(1),
  minimumHours: z.number().int().positive().nullable().optional(),
  pricing: z.object({
    airportTransfer: z.number().nonnegative(),
    sixHours: z.number().nonnegative(),
    twelveHours: z.number().nonnegative(),
    perHour: z.number().nonnegative(),
  }),
});

export type Vehicle = z.infer<typeof vehicleSchema>;

export const vehiclesResponseSchema = z.object({
  data: z.array(vehicleSchema),
  filters: z.object({
    status: z.string().optional(),
    serviceType: serviceTypeSchema.optional(),
    category: vehicleCategorySchema.optional(),
    luxuryOnly: z.boolean().optional(),
    limit: z.number().optional(),
  }),
  meta: z.object({
    total: z.number().int().nonnegative(),
    categories: z.array(vehicleCategorySchema),
    source: z.string(),
  }),
});

export const vehicleDetailResponseSchema = z.object({
  message: z.string(),
  data: vehicleSchema,
  meta: z.object({
    imageCount: z.number().int().nonnegative(),
    source: z.string(),
    featuredFeature: z.string().optional(),
  }),
});

export type VehicleDetailResponse = z.infer<typeof vehicleDetailResponseSchema>;

export const vehiclesFilterSchema = z.object({
  status: z.string().optional(),
  serviceType: serviceTypeSchema.optional(),
  category: vehicleCategorySchema.optional(),
  luxuryOnly: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const bookingQuoteSchema = z.object({
  serviceType: serviceTypeSchema,
  hours: z.number().min(1),
  priceAirportTransfer: z.number().nonnegative(),
  price6Hours: z.number().nonnegative(),
  price12Hours: z.number().nonnegative(),
  pricePerHour: z.number().nonnegative(),
  additionalHours: z.number().int().nonnegative().default(0),
});

export type BookingQuoteInput = z.infer<typeof bookingQuoteSchema>;

export const bookingQuoteRequestSchema = z.object({
  vehicleId: z.string().min(1),
  serviceType: serviceTypeSchema,
  hours: z.number().min(1),
  additionalHours: z.number().int().nonnegative().default(0),
});

export type BookingQuoteRequest = z.infer<typeof bookingQuoteRequestSchema>;

export const bookingQuoteResponseSchema = z.object({
  vehicleId: z.string(),
  vehicleName: z.string(),
  serviceType: serviceTypeSchema,
  totalAmount: z.number().nonnegative(),
  depositAmount: z.number().nonnegative(),
  pricingUsed: z.object({
    airportTransfer: z.number().nonnegative(),
    sixHours: z.number().nonnegative(),
    twelveHours: z.number().nonnegative(),
    perHour: z.number().nonnegative(),
  }),
});

export type BookingQuoteResponse = z.infer<typeof bookingQuoteResponseSchema>;

export const createBookingSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  vehicleId: z.string().min(1),
  tripType: tripTypeSchema,
  serviceType: serviceTypeSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupTime: z.string().min(2).optional(),
  endTime: z.string().min(2).optional(),
  pickupLocation: z.string().min(2),
  pickupNote: z.string().trim().max(160).optional(),
  dropoffLocation: z.string().optional(),
  dropoffNote: z.string().trim().max(160).optional(),
  hours: z.number().min(1),
  additionalHours: z.number().int().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type CreateBookingRequest = z.infer<typeof createBookingSchema>;

export const bookingRecordStatusOptions = ['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_FAILED'] as const;
export const paymentFlowStatusOptions = ['NOT_STARTED', 'CHECKOUT_READY', 'RETURN_PENDING_CONFIRMATION', 'CONFIRMED', 'FAILED'] as const;
export const checkoutSessionModeOptions = ['STRIPE', 'CONFIGURATION_REQUIRED'] as const;
export const paymentReturnStageOptions = ['SUCCESS', 'CANCEL'] as const;

export const bookingRecordSchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.enum(bookingRecordStatusOptions),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  vehicleId: z.string(),
  vehicleName: z.string(),
  tripType: tripTypeSchema,
  serviceType: serviceTypeSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupTime: z.string().optional(),
  endTime: z.string().optional(),
  pickupLocation: z.string(),
  pickupNote: z.string().optional(),
  dropoffLocation: z.string().optional(),
  dropoffNote: z.string().optional(),
  hours: z.number().min(1),
  additionalHours: z.number().int().nonnegative(),
  totalAmount: z.number().nonnegative(),
  depositAmount: z.number().nonnegative(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export type BookingRecord = z.infer<typeof bookingRecordSchema>;

export const bookingPaymentStateSchema = z.object({
  status: z.enum(paymentFlowStatusOptions),
  nextStep: z.string(),
  checkoutReady: z.boolean().default(false),
});

export type BookingPaymentState = z.infer<typeof bookingPaymentStateSchema>;

export const createBookingResponseSchema = z.object({
  message: z.string(),
  data: bookingRecordSchema,
  payment: bookingPaymentStateSchema,
});

export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;

export const bookingLookupQuerySchema = z.object({
  email: z.string().email(),
});

export type BookingLookupQuery = z.infer<typeof bookingLookupQuerySchema>;

export const bookingHistoryQuerySchema = z.object({
  email: z.string().email(),
});

export type BookingHistoryQuery = z.infer<typeof bookingHistoryQuerySchema>;

export const bookingLookupResponseSchema = z.object({
  message: z.string(),
  data: bookingRecordSchema,
  payment: bookingPaymentStateSchema,
});

export type BookingLookupResponse = z.infer<typeof bookingLookupResponseSchema>;

export const createCheckoutSessionSchema = z.object({
  email: z.string().email(),
  origin: z.string().url().optional(),
});

export type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionSchema>;

export const createCheckoutSessionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    reference: z.string(),
    mode: z.enum(checkoutSessionModeOptions),
    amountDue: z.number().nonnegative(),
    currency: z.string(),
    checkoutUrl: z.string().url().optional(),
    sessionId: z.string().optional(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    expiresAt: z.string().optional(),
  }),
  payment: bookingPaymentStateSchema,
});

export type CreateCheckoutSessionResponse = z.infer<typeof createCheckoutSessionResponseSchema>;

export const bookingPaymentReturnQuerySchema = z.object({
  token: z.string().min(8),
  stage: z.enum(paymentReturnStageOptions),
  session_id: z.string().optional(),
});

export type BookingPaymentReturnQuery = z.infer<typeof bookingPaymentReturnQuerySchema>;

export const bookingPaymentReturnResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    stage: z.enum(paymentReturnStageOptions),
    sessionId: z.string().optional(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
    checkoutUrl: z.string().url().optional(),
    expiresAt: z.string().optional(),
    booking: bookingRecordSchema,
  }),
  payment: bookingPaymentStateSchema,
});

export type BookingPaymentReturnResponse = z.infer<typeof bookingPaymentReturnResponseSchema>;

export const bookingHistoryResponseSchema = z.object({
  message: z.string(),
  data: z.array(bookingRecordSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    pendingPayment: z.number().int().nonnegative(),
    confirmed: z.number().int().nonnegative(),
    paymentFailed: z.number().int().nonnegative(),
  }),
});

export type BookingHistoryResponse = z.infer<typeof bookingHistoryResponseSchema>;

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  runtime: z.string(),
});

export type TripType = z.infer<typeof tripTypeSchema>;
export type ServiceType = z.infer<typeof serviceTypeSchema>;

export const airportLocationKeywords = [
  'airport',
  'bandara',
  'terminal',
  'arrival',
  'departure',
  'gate',
  'changi',
  'soekarno',
  'sukarno',
  'hatta',
  'ngurah rai',
] as const;

export function isAirportLocation(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return airportLocationKeywords.some((keyword) => normalized.includes(keyword));
}

export function inferServiceTypeFromTrip(tripType: TripType, pickupLocation: string, dropoffLocation: string): ServiceType {
  if (tripType === 'ROUND_TRIP') {
    return 'RENTAL';
  }

  return isAirportLocation(pickupLocation) || isAirportLocation(dropoffLocation) ? 'AIRPORT_TRANSFER' : 'TRIP';
}

export function calculateTripHours(startDate: string, startTime: string, endDate: string, endTime: string) {
  if (!startDate || !startTime || !endDate || !endTime) {
    return null;
  }

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export function deriveAdditionalHours(hours: number) {
  if (hours <= 6) return 0;
  if (hours <= 12) return hours - 6;
  return hours - 12;
}

export function computeBookingQuote(input: BookingQuoteInput) {
  let base = 0;

  if (input.serviceType === 'AIRPORT_TRANSFER') {
    base = input.priceAirportTransfer;
  } else if (input.serviceType === 'TRIP') {
    base = input.hours <= 6
      ? input.price6Hours
      : input.price6Hours + Math.max(0, input.hours - 6) * input.pricePerHour;
  } else if (input.hours >= 12) {
    base = input.price12Hours + input.additionalHours * input.pricePerHour;
  } else if (input.hours >= 6) {
    base = input.price6Hours + input.additionalHours * input.pricePerHour;
  } else {
    base = input.hours * input.pricePerHour;
  }

  const totalAmount = Number(base.toFixed(2));
  const depositAmount = Number((totalAmount * 0.2).toFixed(2));
  return { totalAmount, depositAmount };
}

export function buildVehicleQuote(vehicle: Vehicle, request: BookingQuoteRequest): BookingQuoteResponse {
  const quote = computeBookingQuote({
    serviceType: request.serviceType,
    hours: request.hours,
    priceAirportTransfer: vehicle.pricing.airportTransfer,
    price6Hours: vehicle.pricing.sixHours,
    price12Hours: vehicle.pricing.twelveHours,
    pricePerHour: vehicle.pricing.perHour,
    additionalHours: request.additionalHours,
  });

  return bookingQuoteResponseSchema.parse({
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    serviceType: request.serviceType,
    totalAmount: quote.totalAmount,
    depositAmount: quote.depositAmount,
    pricingUsed: vehicle.pricing,
  });
}
