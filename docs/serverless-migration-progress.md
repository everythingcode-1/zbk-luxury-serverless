# Serverless Migration Progress

- Last updated: 2026-04-05 01:45 WIB
- Estimated migration progress: 51%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, legacy-inspired vehicle metadata/category filtering, quote flow, booking draft submission, booking reference lookup, airport pickup/dropoff detail notes, and customer booking-history-by-email are now live in the Workers/Vite stack; auth, durable persistence, Stripe completion, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated the next public vehicle slice from the legacy app into the new serverless workspace:
  - Extended the shared vehicle schema/filter contracts with legacy-inspired category, feature highlights, transmission, rating, image list, and luxury flags.
  - Upgraded the Workers public vehicle catalog seed data so each vehicle now exposes richer metadata plus server-side filtering by category and `luxuryOnly`.
  - Extended the React/Vite public catalog UI with category chips, a luxury-only toggle, and richer vehicle detail cards so the new stack now mirrors more of the legacy public browsing experience instead of showing only a flat seed list.
- Kept the slice incremental and reviewable by focusing on public vehicle browsing metadata/filtering rather than jumping ahead to auth or Stripe.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Public vehicle catalog endpoints with seed data, richer legacy-inspired metadata, and category/luxury filtering.
- Public vehicle selection UI with category browsing and richer detail highlights.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract, airport pickup/dropoff detail notes, and booking reference generation.
- Public booking reference lookup flow using booking reference + customer email.
- Public customer booking history snapshot flow using customer email to list recent draft bookings.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Public vehicle detail parity beyond current seed metadata (real images/content sourcing, database-backed catalog management).
- Auth endpoints, session shape, and protected admin access.
- Workers-safe Stripe checkout session creation and webhook-driven booking/payment state updates.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts and lookup results currently live only in Worker memory for this scaffold slice; they are not durable across deploys/restarts.
- Vehicle catalog still comes from curated Worker seed data; category/filter contracts are migrated, but the source is not yet database-backed or admin-editable.
- Airport detail fields are currently driven by lightweight keyword detection in the web form; richer location intelligence from the legacy app is still pending if this slice needs more accuracy later.
- Stripe remains the next critical dependency because booking flow cannot complete payment yet.
- Public history snapshot is currently email-based and unauthenticated, so it is only a transitional bridge until the real auth/session shape and protected customer history land.
