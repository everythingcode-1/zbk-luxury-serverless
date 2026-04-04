import { z } from 'zod';

export const serviceTypeOptions = ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'] as const;
export const vehicleStatusOptions = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED'] as const;

export const serviceTypeSchema = z.enum(serviceTypeOptions);
export const vehicleStatusSchema = z.enum(vehicleStatusOptions);

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: z.string(),
  year: z.number().int(),
  status: vehicleStatusSchema,
  location: z.string(),
  capacity: z.number().int().positive(),
  luggage: z.number().int().nonnegative().nullable().optional(),
  color: z.string(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
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
    limit: z.number().optional(),
  }),
  meta: z.object({
    total: z.number().int().nonnegative(),
    source: z.string(),
  }),
});

export const vehiclesFilterSchema = z.object({
  status: z.string().optional(),
  serviceType: serviceTypeSchema.optional(),
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
  serviceType: serviceTypeSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupTime: z.string().min(2).optional(),
  pickupLocation: z.string().min(2),
  dropoffLocation: z.string().optional(),
  hours: z.number().min(1),
  additionalHours: z.number().int().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional(),
  depositAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type CreateBookingRequest = z.infer<typeof createBookingSchema>;

export const bookingRecordStatusOptions = ['DRAFT', 'PENDING_PAYMENT'] as const;
export const paymentFlowStatusOptions = ['NOT_STARTED'] as const;

export const bookingRecordSchema = z.object({
  id: z.string(),
  reference: z.string(),
  status: z.enum(bookingRecordStatusOptions),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  vehicleId: z.string(),
  vehicleName: z.string(),
  serviceType: serviceTypeSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupTime: z.string().optional(),
  pickupLocation: z.string(),
  dropoffLocation: z.string().optional(),
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

export const bookingLookupResponseSchema = z.object({
  message: z.string(),
  data: bookingRecordSchema,
  payment: bookingPaymentStateSchema.extend({
    checkoutReady: z.boolean(),
  }),
});

export type BookingLookupResponse = z.infer<typeof bookingLookupResponseSchema>;

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  runtime: z.string(),
});

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
