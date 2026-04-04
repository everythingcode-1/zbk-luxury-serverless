# Serverless Migration Progress

- Last updated: 2026-04-04 15:46 WIB
- Estimated migration progress: 40%
- Justification: workspace scaffolding, shared pricing contracts, public vehicle catalog, quote flow, booking draft submission, and now public booking reference lookup are live in the Workers/Vite stack; auth, durable persistence, Stripe completion, and admin/serverless replacement work are still pending.

## Completed this run

- Migrated the next public booking slice from the legacy app into the new serverless workspace:
  - Added shared booking lookup schemas so the web app and Workers API use a typed contract for booking status retrieval.
  - Added a Workers endpoint to fetch an in-memory booking draft by booking reference + customer email.
  - Extended the React/Vite app with a booking tracking card so users can re-check a submitted draft from the same page.
- Wired fresh booking submissions to prefill the lookup form/result, making the slice visibly testable end-to-end.
- Kept the slice Stripe-ready by exposing that checkout is still not connected instead of faking payment completion.

## Current migrated areas

- Monorepo workspace for Cloudflare Workers API + React/Vite web app + shared package.
- Shared vehicle/quote schemas and pricing logic.
- Public vehicle catalog endpoints with seed data.
- Public vehicle selection UI.
- Public booking quote request flow.
- Public booking draft submission flow with typed response contract and booking reference generation.
- Public booking reference lookup flow using booking reference + customer email.
- Basic Worker health endpoint and Stripe webhook placeholder.

## Remaining major areas

- Real persistence for vehicles/bookings/users via Neon/Drizzle instead of in-memory/seed scaffolds.
- Auth endpoints, session shape, and protected admin access.
- Workers-safe Stripe checkout session creation and webhook-driven booking/payment state updates.
- Admin dashboard API + UI migration.
- Replacement of Node-only dependencies/workflows (email sending, uploads, background/admin assumptions).
- Legacy feature parity review for remaining website pages and operational flows.

## Blockers / risks

- Booking drafts and lookup results currently live only in Worker memory for this scaffold slice; they are not durable across deploys/restarts.
- Stripe remains the next critical dependency because booking flow cannot complete payment yet.
- Public lookup currently supports booking reference + email only; authenticated customer history still depends on the future auth/session migration.
- Seed vehicle catalog is still the source of truth until database wiring lands.
