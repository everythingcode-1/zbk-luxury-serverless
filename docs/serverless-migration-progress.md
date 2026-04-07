# Serverless Migration Progress

- Last updated: 2026-04-07 21:52 WIB
- Estimated migration progress: 68%
- Justification: the serverless stack now includes a typed auth session contract plus Workers-safe login, customer registration, session lookup, and logout endpoints, and the React/Vite app has a working auth workspace that exercises those routes; the booking, quote, payment-return, and history slices remain intact, but auth/session persistence is still in-memory and the remaining admin/persistence/payment durability work is still substantial.

## Completed this run

- Migrated the auth/session slice into the serverless workspace:
  - Added shared auth schemas for login, registration, user identity, and session envelopes.
  - Implemented Workers-safe auth routes for generic login, customer login, customer registration, me, and logout.
  - Seeded demo admin/customer accounts so the new auth flow can be exercised immediately in the migrated stack.
  - Added a Vite auth workspace that can sign in, register a customer, refresh the current session, and sign out against the Workers API.
  - Persisted the returned session token in browser localStorage so the web app can rehydrate the current auth state on reload.
- Kept the slice incremental and reviewable by focusing on auth/session shape only; durable storage, protected routes, and admin dashboard migration remain for later runs.

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
- Basic Worker health endpoint and Stripe webhook placeholder.
- Workers-safe auth endpoints plus a small React/Vite auth workspace exercising login/register/me/logout.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session handling, session durability, and admin access control.
- Stripe webhook verification plus booking/payment state persistence updates after checkout completion/cancellation.
- Receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage, so they disappear on deploy/restart and are not yet suitable for production auth.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live only in Worker memory for this scaffold slice; payment return views are therefore not durable across deploys/restarts.
- The return pages summarize the latest Stripe handoff attempt, but they do not yet verify webhook signatures or persist authoritative paid/confirmed state.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot remains email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
