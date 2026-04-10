# Serverless Migration Progress

- Last updated: 2026-04-10 09:11 WIB
- Estimated migration progress: 90%
- Justification: auth now has a cookie-backed transport path that matches the legacy worker flow more closely, while the React/Vite workspace can bootstrap sessions from the Workers API even when localStorage is empty. The migration still lacks durable persistence, but the auth/session bridge is now visible and reviewable on the new stack.

## Completed this run

- Added Workers cookie-backed auth transport so login/register/logout/me now mirror the legacy auth-token flow more closely.
- Added an auth-session bootstrap helper in the Vite app so the auth workspace and admin dashboard can rehydrate from the Workers API even when localStorage is empty.
- Upgraded the auth workspace and admin dashboard fetches to send credentials with auth requests, keeping the cookie-based session path visible in the new serverless UI.
- Kept the workspace/build pipeline green after the auth-session update (`npm run typecheck`, `npm run build:web`, and `npm run build:api` all pass).

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared vehicle capacity-band helpers and filter contract.
- Shared auth/session schemas for login, registration, session lookup, logout, route hints, capability lists, and admin overview reporting.
- Shared public vehicle detail response contract for the fleet spotlight view.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, category/luxury/capacity filtering, and hash-routed fleet / booking demo / how-to-book guide routes built on top of the live fleet data.
- Public vehicle selection UI with category browsing, capacity-band filtering, richer detail highlights, image gallery spotlighting, and a dedicated fleet route.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Stripe webhook intake with signature verification support and in-memory booking/payment confirmation tracking.
- Basic Worker health endpoint and Stripe webhook placeholder routes.
- Workers-safe auth endpoints with cookie-backed auth-token transport plus a small React/Vite auth workspace exercising login/register/me/logout and route-aware session surfacing.
- Serverless admin overview endpoint and hash-routed admin dashboard that can bootstrap the stored auth session from the Workers API.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session handling, session durability, and admin access control.
- Stripe receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Deeper admin CRUD/dashboard migration beyond the current overview slice.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage; the new auth-token cookie improves the transport path but not durability, so they still disappear on deploy/restart.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live in Worker memory; payment return views therefore are not durable across deploys/restarts.
- Webhook verification is Workers-safe, but it falls back to a dev bypass when `STRIPE_WEBHOOK_SECRET` is unset.
- The return pages now reflect webhook-confirmed/failed states, but they still do not persist authoritative paid state outside the Worker runtime.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/capacity/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot remains email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
