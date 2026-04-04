# Serverless Migration Progress

- Last updated: 2026-04-05 03:56 WIB
- Estimated migration progress: 55%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, legacy-inspired vehicle metadata/category filtering, quote flow, booking draft submission, booking reference lookup, airport pickup/dropoff detail notes, customer booking-history-by-email, and now legacy ride-detail logic (one-way vs round-trip, auto service detection, auto-calculated rental hours) are live in the Workers/Vite stack; auth, durable persistence, Stripe completion, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated one coherent booking-flow slice from the legacy app into the serverless workspace:
  - Added shared trip-type contracts/utilities for airport-location detection, one-way vs round-trip service inference, round-trip hour calculation, and derived additional rental hours.
  - Updated the Workers booking draft endpoint to normalize service type server-side from trip details and validate round-trip return date/time before pricing.
  - Extended booking records so lookup/history responses now preserve `tripType` and `endTime`, making the scaffold closer to the legacy ride-detail shape.
  - Reworked the React/Vite booking UI so public customers can switch between one-way and round-trip, see auto-detected service type, get auto-calculated rental duration, and submit those details through the Workers API.
- Kept the slice incremental and reviewable by focusing on public booking ride details instead of jumping ahead to auth or Stripe.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, and category/luxury filtering.
- Public vehicle selection UI with category browsing and richer detail highlights.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, and booking reference generation.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Auth endpoints, session shape, and protected admin access.
- Workers-safe Stripe checkout session creation and webhook-driven booking/payment state updates.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts and lookup results currently live only in Worker memory for this scaffold slice; they are not durable across deploys/restarts.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Airport detection is now shared between web and API, but it is still keyword-based rather than geodata-backed, so some edge-case locations may still classify imperfectly.
- Stripe remains the next critical dependency because booking flow cannot complete payment yet.
- Public history snapshot is currently email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
