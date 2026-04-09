# Serverless Migration Progress

- Last updated: 2026-04-09 19:57 WIB
- Estimated migration progress: 75%
- Justification: the serverless stack now not only exposes the public vehicle detail slice through the Workers API, but also gives the public booking history snapshot a more useful summary by exposing status counts and a direct checkout continuation CTA for pending bookings. The public booking/payment surface is usable end-to-end, but durable persistence, admin migration, and production-grade payment storage are still the biggest remaining gaps.

## Completed this run

- Advanced the public booking history slice in the serverless workspace:
  - Expanded the shared `bookingHistoryResponseSchema` meta contract so the history snapshot can report total, pending, confirmed, and payment-failed counts.
  - Updated `/api/public/bookings` to derive those counts from the Worker’s booking drafts and return them in a typed response.
  - Surfaced the richer summary in the React/Vite history panel and added a per-booking “Continue deposit checkout” CTA for pending bookings so the user can resume payment from the history view.
- Kept the migration incremental by staying inside the public booking/history/payment vertical slice rather than attempting persistence or admin work in the same run.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared auth/session schemas for login, registration, session lookup, and logout.
- Shared public vehicle detail response contract for the fleet spotlight view.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, and category/luxury filtering.
- Public vehicle selection UI with category browsing, richer detail highlights, and image gallery spotlighting.
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
