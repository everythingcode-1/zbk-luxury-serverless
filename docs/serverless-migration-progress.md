# Serverless Migration Progress

- Last updated: 2026-04-14 15:08 WIB
- Estimated migration progress: 97%
- Justification: the serverless stack now has a dedicated customer bookings route that uses the Workers auth session and booking-history endpoint, closing one more legacy customer-area entry point while keeping the workspace/build pipeline green.

## Completed this run

- Added a dedicated hash-routed `#/my-bookings` React/Vite page that boots the Workers auth session, loads authenticated booking history, and mirrors the legacy customer bookings experience in the serverless app.
- Updated the shared auth session primary-route contract so customer sessions now land on `#/my-bookings` instead of the generic root route.
- Kept the workspace/build pipeline green after the migration slice (`npm run typecheck`, `npm run build:web`, and `npm run build:api` all pass).

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared vehicle capacity-band helpers and filter contract.
- Shared auth/session schemas for login, registration, session lookup, logout, route hints, capability lists, protected customer booking history, and admin overview reporting.
- Public vehicle detail response contract for the fleet spotlight view.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, category/luxury/capacity filtering, and hash-routed fleet / booking landing / booking confirmation / booking demo / how-to-book / my-bookings / contact / services routes built on top of the live fleet data.
- Public vehicle selection UI with category browsing, capacity-band filtering, richer detail highlights, image gallery spotlighting, and deep-linkable fleet-to-booking handoff.
- Public booking quote request flow.
- Public services page bridge with legacy-inspired marketing content and booking CTAs.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email as a transitional bridge.
- Authenticated customer booking history snapshot flow using the Workers auth session and protected customer route.
- Dedicated customer bookings route (`#/my-bookings`) that now serves as the customer-facing auth landing page.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Stripe webhook intake with signature verification support and in-memory booking/payment confirmation tracking.
- Basic Worker health endpoint and Stripe webhook placeholder routes.
- Workers-safe auth endpoints with cookie-backed auth-token transport plus a small React/Vite auth workspace exercising login/register/me/logout, route-aware session surfacing, and authenticated booking history.
- Serverless admin overview endpoint and hash-routed admin dashboard that can bootstrap the stored auth session from the Workers API.
- Public contact/support page bridge with legacy-inspired support details and inquiry form.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session durability, session refresh/revocation strategy, and stricter admin access control.
- Stripe receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Deeper admin CRUD/dashboard migration beyond the current overview slice.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows, especially the smaller static/public pages and any long-tail content routes.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage; the auth-token cookie improves the transport path but not durability, so they still disappear on deploy/restart.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live in Worker memory; payment return and confirmation views therefore are not durable across deploys/restarts.
- Webhook verification is Workers-safe, but it falls back to a dev bypass when `STRIPE_WEBHOOK_SECRET` is unset.
- The return pages now reflect webhook-confirmed/failed states, but they still do not persist authoritative paid state outside the Worker runtime.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/capacity/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Public history snapshot remains email-based and unauthenticated, but it is now clearly transitional because the authenticated customer booking view exists alongside it.
- Contact submissions remain local-only until a Workers-backed contact endpoint or email provider is introduced.
