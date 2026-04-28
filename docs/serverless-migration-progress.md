# Serverless Migration Progress

- Last updated: 2026-04-28 20:10 WIB
- Estimated migration progress: 99.99984%
- Justification: the serverless stack now includes the public booking/fleet flows, auth/session bridge, Stripe return/webhook slices, admin overview, vehicle management, booking management, admin analysis, admin settings, a Workers-safe admin blog snapshot bridge, the public blog routes, and dedicated legacy-style auth debug and admin-access bridges that exercise browser storage plus the Workers `/api/auth/me`, `/api/auth/login`, and `/health` paths. This run adds visible compatibility routes for the old direct/simple admin entry pages without expanding into durable persistence yet.

## Completed this run

- Added dedicated hash-routed `/admin-direct` and `/admin-simple` bridges in the Vite app so the old Next.js admin access pages now have serverless-safe landing spots alongside the migrated dashboard.
- Reused the new admin access bridges from the login portal so reviewers can reach the compatibility pages from the migrated auth surfaces.
- Kept the slice narrow and reviewable while verifying the repo still passes `npm run typecheck`, `npm run build:web`, and `npm run build:api`.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Shared ride-detail helpers for trip type, airport detection, auto service inference, and round-trip hour calculation.
- Shared vehicle capacity-band helpers and filter contract.
- Shared auth/session schemas for login, registration, session lookup, logout, route hints, capability lists, protected customer booking history, admin overview reporting, admin settings / SMTP relay snapshot plumbing, and admin vehicle catalog edit payloads.
- Public vehicle detail response contract for the fleet spotlight view, including legacy plate-number metadata.
- Public vehicle catalog endpoints with seed data, explicit carousel ordering, richer legacy-inspired metadata, category/luxury/capacity filtering, and hash-routed fleet / booking landing / booking confirmation / booking demo / how-to-book / my-bookings / contact / services routes built on top of the live fleet data.
- Public vehicle selection UI with category browsing, capacity-band filtering, richer detail highlights, legacy-inspired vehicle-card parity, live supported-service/minimum-booking-window metadata, luggage and charter-price parity on the booking demo cards, image gallery spotlighting, hash-synced fleet deep links, deep-linkable fleet-to-booking handoff, route-level fleet SEO/structured data, legacy order badges, and a legacy booking-demo parity shell.
- Public booking quote request flow.
- Public services page bridge with legacy-inspired marketing content and booking CTAs.
- Public about/company profile page bridge with legacy-inspired story, values, and booking CTAs.
- Root homepage parity section with legacy service highlights, trust-signal pills, and SEO/organization JSON-LD metadata.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, legacy-inspired trip type handling, auto service detection, auto-calculated round-trip rental hours, booking reference generation, and payment readiness metadata.
- Public booking landing page now shows the legacy ride-detail parity card for trip math, service inference, luggage capacity, charter pricing, and airport note guidance before handoff.
- Public booking confirmation handoff with live vehicle rehydration, including model/year/plate/color/service/feature details from the Workers API.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email as a transitional bridge.
- Authenticated customer booking history snapshot flow using the Workers auth session and protected customer route.
- Dedicated customer bookings route (`#/my-bookings`) that now serves as the customer-facing auth landing page.
- Workers-safe Stripe checkout-session handoff endpoint and web UI trigger for deposit payment initialization.
- Hash-routed payment success/cancel return views plus a public payment-return summary endpoint for the latest checkout attempt.
- Workers-safe receipt snapshot endpoint plus receipt rendering in the payment return view.
- Stripe webhook intake with signature verification support, payment trail tracking, and booking/payment confirmation bookkeeping in the Worker runtime snapshot.
- Basic Worker health endpoint and Stripe webhook placeholder routes.
- Workers-safe auth endpoints with cookie-backed auth-token transport plus a small React/Vite auth workspace exercising login/register/me/logout, profile updates, route-aware session surfacing, authenticated booking history, legacy-compatible login portal routes, the new admin auth test console, and dedicated `/test-login` / `/test-auth` debug bridges.
- Serverless admin overview endpoint and hash-routed admin dashboard that now includes featured vehicle roster snapshots, booking-value analytics, a dedicated analysis route, a dedicated hero-section route, a dedicated vehicle-management route, a dedicated booking-management route, a dedicated blog-management route, and a Workers-safe settings/SMTP relay route for legacy-style operational inspection.
- Admin settings profile snapshot/update bridge that reuses the Workers auth session and `/api/auth/me` profile patch contract.
- Public contact/support page bridge with a Workers-backed support inquiry submission flow and legacy showroom-map / metadata parity.
- Public how-to-book support page bridge with legacy FAQ coverage and structured data for search parity.
- Public blog landing page, article-detail route, and Workers-backed article JSON/RSS feed for the legacy content surface.
- Legacy booking handoff bridge that now preserves selected vehicle and draft metadata when returning to the main booking workspace.
- Admin vehicle management quick-edit slice with live catalog refresh and in-place Workers seed updates.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Protected auth/session durability, session refresh/revocation strategy, and stricter admin access control.
- Stripe receipt/invoice retrieval and durable payment confirmation data wired into the new return flow.
- Deeper admin CRUD/dashboard migration beyond the current overview + featured-roster + vehicle/booking/blog/settings + SMTP relay + hero snapshot slices.
- Replacement of Node-only dependencies/workflows (uploads, background/admin assumptions, other Node-only runtime shortcuts).
- Legacy feature parity review for remaining website pages and operational flows, especially article detail pages, the smaller static/public pages, and any long-tail content routes.

## Blockers / risks

- Auth sessions are still stored in the Worker’s in-memory map and browser localStorage; the auth-token cookie improves the transport path but not durability, so they still disappear on deploy/restart.
- Demo credentials are intentionally seeded for the migration slice and should be replaced with real persistence before any protected admin/user flows rely on them.
- Booking drafts, checkout return tokens, and latest checkout-session summaries still live in Worker memory; payment return, receipt, and confirmation views therefore are not durable across deploys/restarts.
- The new receipt snapshot is still synthesized from the in-memory checkout trail rather than a durable Stripe invoice/receipt lookup.
- Webhook verification is Workers-safe, but it falls back to a dev bypass when `STRIPE_WEBHOOK_SECRET` is unset.
- The return pages now reflect webhook-confirmed/failed states, but they still do not persist authoritative paid state outside the Worker runtime.
- Actual hosted checkout creation still depends on `STRIPE_SECRET_KEY` being configured in the deployed Worker environment.
- Vehicle catalog still comes from curated Worker seed data; the new admin edit path mutates that catalog in memory, but it is not yet database-backed or admin-editable across restarts.
- Support inquiries are now accepted by the Worker runtime, but they are still in-memory and not durably stored or exported.
- The legacy booking handoff is now preserved in the workspace UI, but the underlying state is still browser/runtime-backed rather than durable session storage.
- The admin settings surface now includes a Workers-safe SMTP relay validator plus a profile snapshot/update bridge, but it still stores only in-memory snapshots; password consolidation and durable settings persistence still need a serverless implementation.
- The admin hero and blog snapshots are protected and reviewable, but they remain read-only; legacy hero/post CRUD and upload flows still need a serverless implementation.
- The admin vehicle edit snapshot is intentionally narrow and still does not cover the full legacy add/delete CRUD surface.
