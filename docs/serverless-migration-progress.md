# Serverless Migration Progress

- Last updated: 2026-04-07 01:09 WIB
- Estimated migration progress: 61%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, legacy-inspired vehicle metadata/category filtering, quote flow, booking draft submission, booking reference lookup, airport pickup/dropoff detail notes, customer booking-history-by-email, legacy ride-detail logic, and now Workers-safe Stripe checkout-session handoff contracts/UI are live in the Workers/Vite stack; durable persistence, webhook-driven payment confirmation, auth, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated one coherent payment slice from the legacy app into the serverless workspace:
  - Added shared checkout-session request/response contracts plus richer payment-state typing so booking responses can report whether checkout is ready in the current Worker environment.
  - Implemented `POST /api/public/bookings/:reference/checkout` in the Cloudflare Worker, using Stripe's HTTP API directly via `fetch` and `application/x-www-form-urlencoded` instead of a Node-only server helper.
  - Wired Worker payment state to `STRIPE_SECRET_KEY` availability, including generated success/cancel URLs based on the incoming origin or configured web base URL.
  - Updated the React/Vite booking and lookup UI so draft bookings now expose an “Open deposit checkout” action and display the migrated payment handoff status/message.
  - Added `WEB_APP_BASE_URL` configuration scaffolding in the Worker config/env example for local/serverless checkout redirects.
- Kept the slice incremental and reviewable by focusing on checkout-session initialization only; webhook-driven payment confirmation and receipt flows remain for later runs.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, and category/luxury filtering.
- Public vehicle selection UI with category browsing and richer detail highlights.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Auth endpoints, session shape, and protected admin access.
- Stripe webhook verification plus booking/payment state persistence updates after checkout completion/cancellation.
- Payment success/cancel/receipt pages wired to the new serverless checkout flow.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts and lookup results still live only in Worker memory for this scaffold slice; checkout metadata is therefore not durable across deploys/restarts.
- The new checkout endpoint is production-oriented, but actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Stripe webhook handling is still a placeholder, so successful checkout completion does not yet persist paid/confirmed status back into booking records.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot is currently email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
