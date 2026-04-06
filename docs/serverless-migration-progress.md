# Serverless Migration Progress

- Last updated: 2026-04-07 03:20 WIB
- Estimated migration progress: 65%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, legacy-inspired vehicle metadata/category filtering, quote flow, booking draft submission, booking reference lookup, airport pickup/dropoff detail notes, customer booking-history-by-email, legacy ride-detail logic, Workers-safe Stripe checkout-session handoff, and now static-host-safe payment success/cancel return pages plus a payment-return summary endpoint are live in the Workers/Vite stack; durable persistence, webhook-driven payment confirmation, auth, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated one coherent Stripe return-page slice from the legacy app into the serverless workspace:
  - Added shared payment-return query/response contracts plus a `RETURN_PENDING_CONFIRMATION` payment state for post-checkout landing views.
  - Extended the Cloudflare Worker checkout handoff to generate secure return tokens, store the latest checkout attempt metadata in Worker memory, and redirect Stripe back into hash-routed success/cancel views that work on static hosting.
  - Implemented `GET /api/public/bookings/:reference/payment-return` so the new React/Vite app can load a booking/payment summary from Stripe return links without requiring the customer to re-enter email immediately.
  - Added dedicated React/Vite payment success/cancel views that show the booking summary, payment next-step messaging, and a reopen-checkout action from the migrated cancel flow.
  - Switched checkout launch in the web app to same-tab redirect so Stripe return lands back inside the new app flow instead of an auxiliary tab.
- Kept the slice incremental and reviewable by focusing on checkout return handling only; Stripe webhook verification, receipt generation, and durable paid-state persistence remain for later runs.

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
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Auth endpoints, session shape, and protected admin access.
- Stripe webhook verification plus booking/payment state persistence updates after checkout completion/cancellation.
- Receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts, checkout return tokens, and latest checkout-session summaries still live only in Worker memory for this scaffold slice; payment return views are therefore not durable across deploys/restarts.
- The new return pages summarize the latest Stripe handoff attempt, but they do not yet verify webhook signatures or persist authoritative paid/confirmed state.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot remains email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
