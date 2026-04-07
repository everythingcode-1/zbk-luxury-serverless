# Serverless Migration Progress

- Last updated: 2026-04-08 00:00 WIB
- Estimated migration progress: 72%
- Justification: the serverless stack now includes Workers-safe Stripe webhook intake with signature verification support, in-memory payment state transitions, and confirmed/failed booking status propagation back into the lookup/return flow. The public booking slice is already usable end-to-end, but durable persistence, admin migration, and production-grade payment storage are still the biggest remaining gaps.

## Completed this run

- Advanced the Stripe/payment slice in the serverless workspace:
  - Added shared booking/payment lifecycle statuses for confirmed and failed outcomes.
  - Implemented Workers-safe Stripe webhook handling with optional HMAC signature verification, booking-reference extraction from metadata, and booking/payment state updates.
  - Added a second webhook alias under `/api/webhooks/stripe` for easier deployment routing.
  - Persisted checkout session state in Worker memory so return/lookup endpoints can now reflect webhook-confirmed payment outcomes instead of only the initial checkout handoff.
  - Updated the payment return hero copy to surface confirmed/failed webhook states in the Vite UI.
- Kept the migration incremental by staying inside the booking/payment vertical slice rather than attempting durable persistence or the admin dashboard in the same run.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared auth/session schemas for login, registration, session lookup, and logout.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, and category/luxury filtering.
- Public vehicle selection UI with category browsing and richer detail highlights.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Stripe webhook intake with signature verification support and in-memory booking/payment confirmation tracking.
- Basic Worker health endpoint and Stripe webhook placeholder routes.
- Workers-safe auth endpoints plus a small React/Vite auth workspace exercising login/register/me/logout.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session handling, session durability, and admin access control.
- Stripe receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage, so they disappear on deploy/restart and are not yet suitable for production auth.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live in Worker memory; payment return views therefore are not durable across deploys/restarts.
- Webhook verification is Workers-safe, but it falls back to a dev bypass when `STRIPE_WEBHOOK_SECRET` is unset.
- The return pages now reflect webhook-confirmed/failed states, but they still do not persist authoritative paid state outside the Worker runtime.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot remains email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
