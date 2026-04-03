import { z } from 'zod';

export const serviceTypeOptions = ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'] as const;
export const serviceTypeSchema = z.enum(serviceTypeOptions);

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

export const createBookingSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  vehicleId: z.string().min(1),
  serviceType: serviceTypeSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupLocation: z.string().min(2),
  dropoffLocation: z.string().optional(),
  totalAmount: z.number().nonnegative(),
  depositAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

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
    base = input.hours <= 6 ? input.price6Hours : input.price6Hours + Math.max(0, input.hours - 6) * input.pricePerHour;
  } else {
    if (input.hours >= 12) {
      base = input.price12Hours + input.additionalHours * input.pricePerHour;
    } else if (input.hours >= 6) {
      base = input.price6Hours + input.additionalHours * input.pricePerHour;
    } else {
      base = input.hours * input.pricePerHour;
    }
  }

  const totalAmount = Number(base.toFixed(2));
  const depositAmount = Number((totalAmount * 0.2).toFixed(2));
  return { totalAmount, depositAmount };
}
