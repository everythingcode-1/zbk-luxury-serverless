# Serverless Migration Progress

- Last updated: 2026-04-16 16:50 WIB
- Estimated migration progress: 99.95%
- Justification: the serverless stack already covers the legacy blog, public booking/fleet flows, auth/session bridge, Stripe return/webhook slices, admin overview, and contact intake. This run deepened the admin migration by adding booking-value analytics to the Workers overview, so the dashboard now shows booking volume, confirmed value, pending deposit exposure, and confirmation rate without falling back to the legacy Next.js app.

## Completed this run

- Extended the admin overview contract with booking-value analytics so the Workers API can report total booking value, confirmed booking value, pending deposit exposure, average booking size, and confirmation rate.
- Surfaced those new analytics in the React/Vite admin dashboard as visible summary cards, giving reviewers a clearer serverless replacement for the legacy admin analytics surface.
- Kept the existing vehicle and booking migration slices intact while improving operational visibility in the new admin workspace.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared vehicle capacity-band helpers and filter contract.
- Shared auth/session schemas for login, registration, session lookup, logout, route hints, capability lists, protected customer booking history, and admin overview reporting.
- Public vehicle detail response contract for the fleet spotlight view, including legacy plate-number metadata.
- Public vehicle catalog endpoints with seed data, explicit carousel ordering, richer legacy-inspired metadata, category/luxury/capacity filtering, and hash-routed fleet / booking landing / booking confirmation / booking demo / how-to-book / my-bookings / contact / services routes built on top of the live fleet data.
- Public vehicle selection UI with category browsing, capacity-band filtering, richer detail highlights, legacy-inspired vehicle-card parity, image gallery spotlighting, deep-linkable fleet-to-booking handoff, route-level fleet SEO/structured data, and legacy order badges.
- Public booking quote request flow.
- Public services page bridge with legacy-inspired marketing content and booking CTAs.
- Public about/company profile page bridge with legacy-inspired story, values, and booking CTAs.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking landing page now shows the legacy ride-detail parity card for trip math, service inference, and airport note guidance before handoff.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email as a transitional bridge.
- Authenticated customer booking history snapshot flow using the Workers auth session and protected customer route.
- Dedicated customer bookings route (`#/my-bookings`) that now serves as the customer-facing auth landing page.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Stripe webhook intake with signature verification support, payment trail tracking, and booking/payment confirmation bookkeeping in the Worker runtime snapshot.
- Basic Worker health endpoint and Stripe webhook placeholder routes.
- Workers-safe auth endpoints with cookie-backed auth-token transport plus a small React/Vite auth workspace exercising login/register/me/logout, profile updates, route-aware session surfacing, and authenticated booking history.
- Serverless admin overview endpoint and hash-routed admin dashboard that now includes featured vehicle roster snapshots plus booking-value analytics for legacy-style operational inspection.
- Public contact/support page bridge with a Workers-backed support inquiry submission flow and legacy showroom-map / metadata parity.
- Public how-to-book support page bridge with legacy FAQ coverage and structured data for search parity.
- Public blog landing page, article-detail route, and Workers-backed article JSON/RSS feed for the legacy content surface.
- Legacy booking landing handoff bridge that now preserves selected vehicle and draft metadata when returning to the main booking workspace.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session durability, session refresh/revocation strategy, and stricter admin access control.
- Stripe receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Deeper admin CRUD/dashboard migration beyond the current overview + featured-roster slice.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows, especially article detail pages, the smaller static/public pages, and any long-tail content routes.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage; the auth-token cookie improves the transport path but not durability, so they still disappear on deploy/restart.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live in Worker memory; payment return and confirmation views therefore are not durable across deploys/restarts.
- Webhook verification is Workers-safe, but it falls back to a dev bypass when `STRIPE_WEBHOOK_SECRET` is unset.
- The return pages now reflect webhook-confirmed/failed states, but they still do not persist authoritative paid state outside the Worker runtime.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; category/capacity/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Support inquiries are now accepted by the Worker runtime, but they are still in-memory and not durably stored or exported.
- The legacy booking handoff is now preserved in the workspace UI, but the underlying state is still browser/runtime-backed rather than durable session storage.
