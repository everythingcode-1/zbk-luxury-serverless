# ZBK Luxury Cloudflare Migration Plan

> For Hermes: execute in phases, starting from core shared domain, Hono API skeleton, Drizzle schema, then React Pages UI.

## Goal
Mengubah ZBK Luxury dari Next.js fullstack menjadi monorepo serverless dengan backend Hono Workers + Neon dan frontend React Pages.

## Phase 1
- Scaffold monorepo target
- Copy legacy app sebagai referensi
- Define shared domain schema
- Define initial Drizzle schema
- Build Hono route skeleton
- Build React app shell

## Phase 2
- Migrate vehicles/public booking flow
- Migrate auth
- Migrate Stripe checkout/webhook
- Migrate admin dashboard endpoints

## Phase 3
- Replace uploads/email runtime dependencies
- Harden auth/rate limiting
- Remove legacy dependencies
