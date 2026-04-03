-- Migration: Add pickupNote and dropoffNote columns to bookings table
-- Safe migration: Only adds new columns, does not modify or delete existing data
-- Date: 2025-01-XX

-- Add pickupNote column (nullable)
ALTER TABLE "bookings" 
ADD COLUMN IF NOT EXISTS "pickupNote" TEXT;

-- Add dropoffNote column (nullable)
ALTER TABLE "bookings" 
ADD COLUMN IF NOT EXISTS "dropoffNote" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "bookings"."pickupNote" IS 'Additional notes for pickup location (e.g., Terminal 1, Gate A)';
COMMENT ON COLUMN "bookings"."dropoffNote" IS 'Additional notes for dropoff location (e.g., Terminal 2, Departure Hall)';







