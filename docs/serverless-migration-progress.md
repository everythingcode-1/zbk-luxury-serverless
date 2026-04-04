# Serverless Migration Progress

- Last updated: 2026-04-04 17:51 WIB
- Estimated migration progress: 43%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, quote flow, booking draft submission, booking reference lookup, and now airport pickup/dropoff detail notes are live in the Workers/Vite stack; auth, durable persistence, Stripe completion, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated the next public booking slice from the legacy app into the new serverless workspace:
  - Added shared booking schemas for `pickupNote` and `dropoffNote` so the Workers API and React/Vite web app stay on the same typed contract.
  - Extended the Workers booking draft endpoint to persist pickup/dropoff notes in the in-memory booking record and to default the dropoff location to pickup when omitted, matching the legacy behavior more closely.
  - Extended the React/Vite booking form to reveal airport detail fields when a pickup or dropoff location looks airport-related, then surfaced those details in the booking submission result and tracking lookup card.
- Kept the slice incremental and reviewable by migrating location-detail handling without coupling it to the future auth or Stripe work.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Public vehicle catalog endpoints with seed data.
- Public vehicle selection UI.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, and booking reference generation.
- Public booking reference lookup flow using booking reference + customer email.
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
- Public lookup currently supports booking reference + email only; authenticated customer history still depends on the future auth/session migration.
- Seed vehicle catalog is still the source of truth until database wiring lands.
