# Serverless Migration Progress

- Last updated: 2026-04-04 19:58 WIB
- Estimated migration progress: 47%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, quote flow, booking draft submission, booking reference lookup, airport pickup/dropoff detail notes, and now a customer booking-history-by-email slice are live in the Workers/Vite stack; auth, durable persistence, Stripe completion, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated the next public booking slice from the legacy app into the new serverless workspace:
  - Added shared booking history query/response schemas so the Workers API and React/Vite app can exchange a typed list of booking drafts by customer email.
  - Added `GET /api/public/bookings?email=...` to the Workers API, returning the latest booking drafts first plus simple aggregate metadata for total drafts and pending-payment drafts.
  - Extended the React/Vite demo app with a public customer booking history snapshot section that loads all draft bookings for an email, giving the migration a first bridge toward the legacy “my bookings” experience without waiting for auth/session migration.
- Kept the slice incremental and reviewable by shipping email-based booking history as a public booking-flow improvement rather than jumping ahead to the full auth stack.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Public vehicle catalog endpoints with seed data.
- Public vehicle selection UI.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, and booking reference generation.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Auth endpoints, session shape, and protected admin access.
- Workers-safe Stripe checkout session creation and webhook-driven booking/payment state updates.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts and lookup results currently live only in Worker memory for this scaffold slice; they are not durable across deploys/restarts.
- Airport detail fields are currently driven by lightweight keyword detection in the web form; richer location intelligence from the legacy app is still pending if this slice needs more accuracy later.
- Stripe remains the next critical dependency because booking flow cannot complete payment yet.
- Public history snapshot is currently email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
- Seed vehicle catalog is still the source of truth until database wiring lands.
