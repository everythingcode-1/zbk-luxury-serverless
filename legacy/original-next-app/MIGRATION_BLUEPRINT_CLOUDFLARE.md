ZBK Luxury → Cloudflare Serverless Migration Blueprint

Current stack
- Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS.
- Next API routes used as full backend.
- Prisma 5 + PostgreSQL datasource.
- Auth is custom JWT + bcryptjs, not actually using next-auth despite dependency.
- Payments use Stripe Checkout + webhook + fallback confirm endpoint.
- Email uses nodemailer SMTP.
- Image upload uses Node fs + sharp to write into public/uploads; separate helper exists for direct unsigned Cloudinary upload.
- Admin dashboard and public website live in one app.

Major business domains / entities
- User: admin / manager accounts.
- Customer: self-registered customer portal users with JWT auth and booking history.
- Vehicle: core fleet entity; pricing, availability, images, features, maintenance dates.
- Booking: central transactional entity; serviceType, schedule, pickup/dropoff, payment state, Stripe IDs.
- MaintenanceRecord: vehicle maintenance log.
- BlogPost: CMS/blog content.
- HeroSection: homepage CMS block.
- Settings: generic key/value config.
- Service and ContactMessage exist in schema but have little or no active API usage.

Important codebase findings / blockers
- Prisma client is instantiated directly in src/lib/prisma.ts and imported almost everywhere in API routes; this must be removed for Workers.
- Several routes rely on Node-only runtime:
  - fs/promises + process.cwd + public disk reads/writes
  - sharp image processing
  - nodemailer SMTP sockets
  - Stripe server SDK in node runtime routes
- Auth middleware is disabled (src/middleware.ts.disabled); most admin endpoints appear effectively unprotected except for login/me flows.
- Schema / API drift exists:
  - Vehicle.category is referenced in routes but does not exist in prisma/schema.prisma.
  - README mentions priceTrip but schema uses priceAirportTransfer + pricePerHour/price6Hours/price12Hours.
  - Public vehicle route and admin vehicle route assume category filtering that schema cannot support as-is.
- Customer auth rate limiting is in-memory Map, unsuitable for distributed serverless runtime.
- Uploads are persisted to local filesystem under public/uploads, incompatible with Workers/Pages deployment.
- Email templates embed /api/logo which currently serves local file from fs.

Critical API surface to migrate first
1) Booking + payment flow
- /api/bookings
- /api/booking
- /api/public/booking
- /api/stripe/create-checkout-session
- /api/stripe/webhook
- /api/stripe/confirm-payment
- /api/stripe/receipt
- /api/bookings/[id]
- /api/bookings/[id]/email
- /api/customer/bookings

2) Fleet / pricing / availability
- /api/vehicles
- /api/vehicles/[id]
- /api/public/vehicles
- /api/admin/vehicles

3) Auth
- /api/auth/login
- /api/auth/me
- /api/auth/logout
- /api/auth/update-profile
- /api/auth/customer/register
- /api/auth/customer/login

4) CMS / admin content
- /api/blog
- /api/blog/[id]
- /api/public/articles
- /api/hero-section
- /api/admin/hero-section
- /api/settings
- /api/analytics
- /api/admin/realtime-stats
- /api/admin/bookings and /api/admin/bookings/[id]

Recommended target architecture
Monorepo
- apps/web
  - React SPA/SSR app for Cloudflare Pages.
  - Public marketing site, booking UI, blog UI, customer portal, admin UI.
  - Consume backend via typed HTTP client only.
- apps/api
  - Hono app deployed to Cloudflare Workers.
  - REST endpoints for auth, bookings, vehicles, blog, settings, analytics, uploads signing, Stripe webhook.
- packages/db
  - Drizzle or Prisma replacement layer for Neon Postgres.
  - SQL schema, migrations, seeds, query helpers.
- packages/shared
  - zod schemas, DTOs, enums, pricing logic, auth types.
- packages/email
  - template generators only (pure functions).
- packages/config
  - env validation, constants, route maps.

Recommended data/runtime choices
- Database: Neon Postgres.
- ORM/query layer: prefer Drizzle ORM or Kysely for first-class Workers compatibility. Avoid standard Prisma Client in Workers unless deliberately using Prisma Accelerate/Data Proxy and accepting extra complexity/cost.
- Auth:
  - Admin + customer auth via signed JWT or Lucia-style session strategy.
  - Store refresh/session records in Postgres or Cloudflare KV/D1 only if needed.
  - Put role claims in JWT; validate in Hono middleware.
  - Cookies should be httpOnly/secure/sameSite=lax or strict.
- Rate limiting: Cloudflare rate limiting or KV/Durable Object, not in-memory Map.
- Email: replace nodemailer SMTP with HTTP-based provider that works in Workers (Resend, Postmark, Mailgun API, SendGrid API).
- Uploads: direct browser upload to Cloudinary or R2 via signed upload URL; image transformation should be delegated to provider, not sharp in Worker.
- Static assets like logo should live in Pages public assets or object storage/CDN, not fs-backed API routes.

Cloudflare-specific migration notes
- Hono Workers cannot use fs, path disk access, Buffer-heavy node assumptions, raw SMTP, or sharp.
- Stripe on Workers is possible, but webhook signature verification must use request raw body exactly once and worker-compatible Stripe/Web Crypto setup. Consider dedicated /webhooks/stripe route in Hono.
- If using Neon serverless driver, use HTTP/WebSocket compatible client. Keep transactions minimal around webhook updates.
- Avoid long synchronous workflows in webhook; update booking/payment state, enqueue email/send notification separately if possible.

Suggested backend route grouping in Hono
- /auth/admin/*
- /auth/customers/*
- /vehicles/*
- /bookings/*
- /payments/stripe/*
- /cms/blog/*
- /cms/hero-sections/*
- /settings/*
- /analytics/*
- /uploads/*
- /webhooks/stripe

Migration priority order
Phase 0: audit + normalization
- Freeze schema drift and decide canonical fields (category? priceTrip? service enums?).
- Convert Prisma schema to SQL migrations for Neon.
- Extract pure shared logic: pricing, zod validation, DTOs, enums.

Phase 1: core backend on Hono
- Rebuild vehicles, bookings, Stripe checkout, Stripe webhook, receipt, and customer booking lookup.
- Move pricing logic into packages/shared and use only there.
- Implement auth middleware + role checks before migrating admin UI calls.

Phase 2: storage + email
- Replace local upload endpoints with Cloudinary/R2 signed upload flow.
- Replace nodemailer with Resend/Postmark HTTP API.
- Replace /api/logo and /api/uploads/* with CDN/object URLs.

Phase 3: admin/customer auth hardening
- Migrate admin JWT and customer JWT/session flows into Hono.
- Re-enable protected admin routes at API layer.
- Add durable rate limiting + audit logging for auth and payment endpoints.

Phase 4: CMS + analytics
- Move blog CRUD, hero sections, settings, analytics, public article ingest.
- Clean up fallback mock-data behavior and make failures explicit.

Phase 5: frontend extraction to React/Pages
- Move Next app into a React app (Vite or TanStack Start/React Router) for Cloudflare Pages.
- Replace server component/data route assumptions with client/server fetches to Hono API.
- Keep SEO pages/blog either as prerendered static pages or SSR via Pages Functions if required.

Practical endpoint ownership after migration
Move to Hono Workers backend
- All current /api/* business logic.
- Stripe checkout/webhook/receipt/confirm-payment.
- All auth.
- Blog/admin CMS CRUD.
- Analytics aggregation.
- Upload signing and storage coordination.

Keep in React/Pages UI
- Public pages, booking flow UX, admin dashboard UI, customer portal UI, blog rendering, marketing content presentation.
- Shared pricing preview can run client-side using the extracted shared package, but final booking price must be recomputed on backend.

Recommended immediate cleanup before migration starts
- Remove next-auth dependency if unused.
- Lock canonical auth strategy and cookie/header behavior.
- Fix schema mismatch around Vehicle.category and pricing fields.
- Consolidate duplicate booking creation endpoints into one canonical service.
- Consolidate duplicate payment confirmation/email sending paths to avoid double-send races.
- Identify all admin routes currently lacking authorization and patch before any public deployment.
