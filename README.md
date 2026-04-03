# ZBK Luxury Serverless

Monorepo migrasi ZBK Luxury dari Next.js fullstack ke arsitektur serverless:
- Backend: Hono di Cloudflare Workers
- Database: Neon Postgres
- Query layer: Drizzle ORM
- UI: React + Vite untuk Cloudflare Pages

## Struktur

- `apps/api` → Hono Workers API
- `apps/web` → React UI untuk Pages
- `packages/shared` → types, schema, pricing logic
- `packages/db` → Drizzle schema + Neon connection helpers
- `legacy/original-next-app` → snapshot aplikasi lama sebagai referensi migrasi

## Fokus fase awal

1. Extract contract data + pricing logic ke shared package
2. Bangun skeleton Hono API untuk vehicles/bookings/auth/payments
3. Bangun UI React shell yang konsumsi API baru
4. Migrasikan modul secara bertahap dari legacy app

## Deploy target

### API
Cloudflare Workers via `wrangler deploy`

### UI
Cloudflare Pages via Vite build output

## Catatan penting

- Upload file lokal, `sharp`, dan SMTP tidak cocok untuk Workers
- Ganti email ke provider HTTP seperti Resend/Postmark
- Ganti upload ke Cloudinary direct upload atau R2 signed upload
- Stripe webhook harus diproses dari raw body di Worker
