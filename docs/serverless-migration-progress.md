# Serverless Migration Progress

- Last updated: 2026-04-04 13:38 WIB
- Estimated migration progress: 36%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, quote flow, and now public booking draft submission are live in the new Workers/Vite stack; auth, Stripe completion, real persistence, and admin/serverless replacement work are still pending.

## Completed this run

- Fixed the current web workspace blocker by adding Vite `import.meta.env` typing support.
- Expanded shared booking contracts so the new stack has a typed request/response shape for public booking submissions.
- Migrated the next public booking slice into the new serverless workspace:
  - React/Vite web app now includes a booking draft submission form with customer, itinerary, and notes fields.
  - Workers/Hono API now validates bookings, recalculates totals from shared pricing logic, generates a booking reference, and returns a typed pending-payment booking draft response.
- Kept the slice explicitly Stripe-ready by returning the next payment step without pretending checkout is implemented yet.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Public vehicle catalog endpoints with seed data.
- Public vehicle selection UI.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract and booking reference generation.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Auth endpoints, session shape, and protected admin access.
- Workers-safe Stripe checkout session creation and webhook-driven booking/payment state updates.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts currently live only in Worker memory for this scaffold slice; they are not durable across deploys/restarts.
- Stripe remains the next critical dependency because booking flow cannot complete payment yet.
- New public booking flow is intentionally narrower than the legacy multi-step Next.js form; richer service heuristics and persistence still need migration.
- Seed vehicle catalog is still the source of truth until database wiring lands.
