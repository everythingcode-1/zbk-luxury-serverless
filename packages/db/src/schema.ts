import { boolean, integer, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['ADMIN', 'MANAGER']);
export const vehicleStatusEnum = pgEnum('vehicle_status', ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RESERVED']);
export const bookingStatusEnum = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED']);
export const serviceTypeEnum = pgEnum('service_type', ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  password: text('password').notNull(),
  role: roleEnum('role').notNull().default('ADMIN'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 120 }).notNull(),
  lastName: varchar('last_name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 80 }).notNull(),
  password: text('password').notNull(),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  year: integer('year').notNull(),
  status: vehicleStatusEnum('status').notNull().default('AVAILABLE'),
  location: varchar('location', { length: 255 }).notNull(),
  plateNumber: varchar('plate_number', { length: 100 }).notNull().unique(),
  capacity: integer('capacity').notNull(),
  luggage: integer('luggage'),
  color: varchar('color', { length: 120 }).notNull(),
  priceAirportTransfer: numeric('price_airport_transfer', { precision: 12, scale: 2 }),
  price6Hours: numeric('price_6_hours', { precision: 12, scale: 2 }),
  price12Hours: numeric('price_12_hours', { precision: 12, scale: 2 }),
  pricePerHour: numeric('price_per_hour', { precision: 12, scale: 2 }),
  minimumHours: integer('minimum_hours'),
  carouselOrder: integer('carousel_order'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id'),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 100 }).notNull(),
  vehicleId: uuid('vehicle_id').notNull(),
  serviceType: serviceTypeEnum('service_type').notNull().default('RENTAL'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  pickupLocation: text('pickup_location').notNull(),
  dropoffLocation: text('dropoff_location'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  depositAmount: numeric('deposit_amount', { precision: 12, scale: 2 }),
  status: bookingStatusEnum('status').notNull().default('PENDING'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('PENDING'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
