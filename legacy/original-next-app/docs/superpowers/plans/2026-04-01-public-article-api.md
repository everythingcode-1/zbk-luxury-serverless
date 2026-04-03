# Public Article API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a token-protected public `POST /api/public/articles` endpoint that publishes AI-written blog articles automatically, validates input strictly, generates unique slugs, and includes operator documentation for high-quality daily use.

**Architecture:** Keep the App Router route thin and move payload parsing, normalization, validation error formatting, and slug generation into a dedicated helper module under `src/lib`. Test the behavior with Node's built-in test runner via `tsx --test`, and expose the route as a dependency-injected factory so auth, validation, and persistence behavior can be verified without a live database.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Zod, Node test runner with `tsx`, Markdown documentation.

---

## File Structure

- Create: `src/lib/blog-public-api.ts`
  Responsibility: schema validation, normalization, field error formatting, slug normalization, unique slug resolution, and published-record shaping.
- Create: `src/app/api/public/articles/route.ts`
  Responsibility: bearer token check, JSON parsing, helper orchestration, Prisma persistence wiring, and stable HTTP responses.
- Create: `src/test/public-article-api.test.ts`
  Responsibility: helper and route behavior coverage without a live database.
- Create: `docs/PUBLIC_ARTICLE_API.md`
  Responsibility: operator-facing usage guide for the AI workflow, including request examples and content quality rules.
- Modify: `package.json`
  Responsibility: add a targeted test command for this feature.

### Task 1: Add Helper Tests And Helper Module

**Files:**
- Modify: `package.json`
- Create: `src/test/public-article-api.test.ts`
- Create: `src/lib/blog-public-api.ts`

- [ ] **Step 1: Add a targeted test command**

Update the `scripts` section in `package.json` to include a targeted command for this feature.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "build:analyze": "cross-env ANALYZE=true npm run build",
    "start": "next start",
    "lint": "eslint",
    "test": "tsx --test \"src/test/**/*.test.ts\"",
    "test:public-article-api": "tsx --test src/test/public-article-api.test.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:setup": "node scripts/setup-database.js",
    "db:reset": "prisma db push --force-reset",
    "db:seed": "npx tsx prisma/seed-complete.ts",
    "db:seed:vehicles": "npx tsx prisma/seed-vehicles.ts",
    "db:seed:blog": "node scripts/seed-blog.js",
    "db:seed:seo": "node scripts/seed-seo-articles.js",
    "db:seed:customers": "node scripts/seed-test-customers.js",
    "db:seed:all": "npm run db:generate && npm run db:seed",
    "db:setup:production": "npx prisma generate && npx prisma db push --accept-data-loss && npm run db:seed",
    "db:migrate:deploy": "npx prisma migrate deploy || npx prisma db push --accept-data-loss",
    "db:push:production": "npx prisma db push --accept-data-loss",
    "test:db": "node --loader ts-node/esm -e \"import('./src/lib/prisma.js').then(m => m.prisma.$connect()).then(() => console.log('✅ Database connected!')).catch(e => console.error('❌ Connection failed:', e.message))\"",
    "test:create-data": "curl -X POST http://localhost:3000/api/test-data || echo 'Make sure dev server is running: npm run dev'",
    "test:email": "node scripts/send-test-email.js",
    "optimize:images": "next-optimized-images",
    "lighthouse": "lighthouse https://www.zbktransportservices.com --output=html --output-path=./lighthouse-report --chrome-flags=--headless"
  }
}
```

- [ ] **Step 2: Write the failing helper tests**

Create `src/test/public-article-api.test.ts` with helper-focused tests first.

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPublishedArticleData,
  normalizeSlugCandidate,
  parsePublicArticleInput,
  resolveUniqueSlug,
} from '@/lib/blog-public-api';

const validPayload = {
  title: 'Luxury Airport Transfer Jakarta Guide',
  excerpt:
    'Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.',
  content: `# Luxury Airport Transfer Jakarta

Memilih layanan transportasi premium tidak cukup hanya melihat harga.

Anda perlu mengevaluasi reputasi penyedia, kualitas armada, kenyamanan penjemputan, dan fleksibilitas layanan.

Artikel ini merangkum langkah praktis agar pemesanan airport transfer terasa lebih aman, rapi, dan profesional untuk kebutuhan perjalanan harian maupun tamu bisnis.`,
  author: '',
  tags: [' airport transfer ', 'jakarta', '', 'jakarta'],
  images: ['https://example.com/cover.jpg', '', 'https://example.com/gallery.jpg'],
};

test('normalizeSlugCandidate converts free text into lowercase kebab-case', () => {
  assert.equal(
    normalizeSlugCandidate(' Luxury Airport Transfer Jakarta!!! '),
    'luxury-airport-transfer-jakarta',
  );
});

test('parsePublicArticleInput trims content, removes blank array items, and defaults author', () => {
  const parsed = parsePublicArticleInput(validPayload);

  assert.equal(parsed.author, 'ZBK AI Writer');
  assert.deepEqual(parsed.tags, ['airport transfer', 'jakarta']);
  assert.deepEqual(parsed.images, [
    'https://example.com/cover.jpg',
    'https://example.com/gallery.jpg',
  ]);
});

test('resolveUniqueSlug appends an incrementing suffix when the base slug is already taken', async () => {
  const checks: string[] = [];

  const slug = await resolveUniqueSlug('luxury-airport-transfer-jakarta', async (candidate) => {
    checks.push(candidate);
    return candidate === 'luxury-airport-transfer-jakarta';
  });

  assert.equal(slug, 'luxury-airport-transfer-jakarta-1');
  assert.deepEqual(checks, [
    'luxury-airport-transfer-jakarta',
    'luxury-airport-transfer-jakarta-1',
  ]);
});

test('createPublishedArticleData marks the article as published and preserves normalized content', () => {
  const parsed = parsePublicArticleInput(validPayload);
  const publishedAt = new Date('2026-04-01T12:00:00.000Z');

  const result = createPublishedArticleData(
    parsed,
    'luxury-airport-transfer-jakarta-guide',
    publishedAt,
  );

  assert.equal(result.slug, 'luxury-airport-transfer-jakarta-guide');
  assert.equal(result.isPublished, true);
  assert.equal(result.publishedAt.toISOString(), '2026-04-01T12:00:00.000Z');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run:

```bash
npm run test:public-article-api
```

Expected: FAIL with a module resolution error for `@/lib/blog-public-api` because the helper file does not exist yet.

- [ ] **Step 4: Write the minimal helper implementation**

Create `src/lib/blog-public-api.ts`.

```ts
import { z } from 'zod';

export interface NormalizedPublicArticleInput {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  images: string[];
  slug?: string;
}

export interface PublicArticleCreateData extends NormalizedPublicArticleInput {
  slug: string;
  isPublished: true;
  publishedAt: Date;
}

const publicArticleInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(10, 'Title must be at least 10 characters')
      .max(160, 'Title must be 160 characters or fewer'),
    excerpt: z
      .string()
      .trim()
      .min(50, 'Excerpt must be at least 50 characters')
      .max(300, 'Excerpt must be 300 characters or fewer'),
    content: z
      .string()
      .trim()
      .min(200, 'Content must be at least 200 characters'),
    author: z
      .string()
      .trim()
      .max(80, 'Author must be 80 characters or fewer')
      .optional(),
    tags: z
      .array(z.string().trim().max(40, 'Each tag must be 40 characters or fewer'))
      .optional(),
    images: z
      .array(z.string().trim().max(2048, 'Each image URL must be 2048 characters or fewer'))
      .optional(),
    slug: z
      .string()
      .trim()
      .max(160, 'Slug must be 160 characters or fewer')
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const normalizedTags = dedupeNonEmpty(value.tags ?? []);
    const normalizedImages = dedupeNonEmpty(value.images ?? []);

    if (normalizedTags.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tags'],
        message: 'Tags must contain 10 items or fewer',
      });
    }

    if (normalizedImages.length > 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images'],
        message: 'Images must contain 5 items or fewer',
      });
    }

    normalizedImages.forEach((image, index) => {
      try {
        const parsedUrl = new URL(image);

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['images', index],
            message: 'Image URLs must start with http:// or https://',
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['images', index],
          message: 'Each image must be a valid absolute URL',
        });
      }
    });
  });

function dedupeNonEmpty(values: string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, allValues) => allValues.indexOf(value) === index);
}

export function parsePublicArticleInput(input: unknown): NormalizedPublicArticleInput {
  const parsed = publicArticleInputSchema.parse(input);

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    author: parsed.author || 'ZBK AI Writer',
    tags: dedupeNonEmpty(parsed.tags ?? []),
    images: dedupeNonEmpty(parsed.images ?? []),
    slug: parsed.slug || undefined,
  };
}

export function normalizeSlugCandidate(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || 'article';
}

export async function resolveUniqueSlug(
  baseSlug: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = baseSlug;
  let counter = 1;

  while (await slugExists(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function createPublishedArticleData(
  input: NormalizedPublicArticleInput,
  slug: string,
  publishedAt = new Date(),
): PublicArticleCreateData {
  return {
    ...input,
    slug,
    isPublished: true,
    publishedAt,
  };
}

export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((details, issue) => {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'body';
    details[key] ??= [];
    details[key].push(issue.message);
    return details;
  }, {});
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run:

```bash
npm run test:public-article-api
```

Expected: PASS with 4 passing tests in `src/test/public-article-api.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/blog-public-api.ts src/test/public-article-api.test.ts
git commit -m "test: add public article api helper coverage"
```

### Task 2: Add Route Tests And Public Route Handler

**Files:**
- Modify: `src/test/public-article-api.test.ts`
- Create: `src/app/api/public/articles/route.ts`

- [ ] **Step 1: Extend the test file with route behavior tests**

Replace `src/test/public-article-api.test.ts` with the full helper-plus-route test suite below.

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPublicArticlesPostHandler,
  type PublicArticleRouteDeps,
} from '@/app/api/public/articles/route';
import {
  createPublishedArticleData,
  normalizeSlugCandidate,
  parsePublicArticleInput,
  resolveUniqueSlug,
  type PublicArticleCreateData,
} from '@/lib/blog-public-api';

const validPayload = {
  title: 'Luxury Airport Transfer Jakarta Guide',
  excerpt:
    'Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.',
  content: `# Luxury Airport Transfer Jakarta

Memilih layanan transportasi premium tidak cukup hanya melihat harga.

Anda perlu mengevaluasi reputasi penyedia, kualitas armada, kenyamanan penjemputan, dan fleksibilitas layanan.

Artikel ini merangkum langkah praktis agar pemesanan airport transfer terasa lebih aman, rapi, dan profesional untuk kebutuhan perjalanan harian maupun tamu bisnis.`,
  author: '',
  tags: [' airport transfer ', 'jakarta', '', 'jakarta'],
  images: ['https://example.com/cover.jpg', '', 'https://example.com/gallery.jpg'],
};

function makeRequest(body: unknown, token?: string): Request {
  return new Request('http://localhost:3000/api/public/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function createRouteDeps(
  overrides: Partial<PublicArticleRouteDeps> = {},
): {
  deps: PublicArticleRouteDeps;
  getCreatedPayload: () => PublicArticleCreateData | null;
} {
  let createdPayload: PublicArticleCreateData | null = null;

  return {
    deps: {
      articleApiToken: 'top-secret-token',
      now: () => new Date('2026-04-01T12:00:00.000Z'),
      findPostBySlug: async () => null,
      createPost: async (data) => {
        createdPayload = data;
        return {
          id: 'post-1',
          title: data.title,
          slug: data.slug,
          isPublished: data.isPublished,
          publishedAt: data.publishedAt,
        };
      },
      ...overrides,
    },
    getCreatedPayload: () => createdPayload,
  };
}

test('normalizeSlugCandidate converts free text into lowercase kebab-case', () => {
  assert.equal(
    normalizeSlugCandidate(' Luxury Airport Transfer Jakarta!!! '),
    'luxury-airport-transfer-jakarta',
  );
});

test('parsePublicArticleInput trims content, removes blank array items, and defaults author', () => {
  const parsed = parsePublicArticleInput(validPayload);

  assert.equal(parsed.author, 'ZBK AI Writer');
  assert.deepEqual(parsed.tags, ['airport transfer', 'jakarta']);
  assert.deepEqual(parsed.images, [
    'https://example.com/cover.jpg',
    'https://example.com/gallery.jpg',
  ]);
});

test('resolveUniqueSlug appends an incrementing suffix when the base slug is already taken', async () => {
  const checks: string[] = [];

  const slug = await resolveUniqueSlug('luxury-airport-transfer-jakarta', async (candidate) => {
    checks.push(candidate);
    return candidate === 'luxury-airport-transfer-jakarta';
  });

  assert.equal(slug, 'luxury-airport-transfer-jakarta-1');
  assert.deepEqual(checks, [
    'luxury-airport-transfer-jakarta',
    'luxury-airport-transfer-jakarta-1',
  ]);
});

test('createPublishedArticleData marks the article as published and preserves normalized content', () => {
  const parsed = parsePublicArticleInput(validPayload);
  const publishedAt = new Date('2026-04-01T12:00:00.000Z');

  const result = createPublishedArticleData(
    parsed,
    'luxury-airport-transfer-jakarta-guide',
    publishedAt,
  );

  assert.equal(result.slug, 'luxury-airport-transfer-jakarta-guide');
  assert.equal(result.isPublished, true);
  assert.equal(result.publishedAt.toISOString(), '2026-04-01T12:00:00.000Z');
});

test('buildPublicArticlesPostHandler returns 401 when the bearer token is missing', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(makeRequest(validPayload));

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Unauthorized',
  });
  assert.equal(getCreatedPayload(), null);
});

test('buildPublicArticlesPostHandler returns 401 when the bearer token is wrong', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(makeRequest(validPayload, 'wrong-token'));

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Unauthorized',
  });
  assert.equal(getCreatedPayload(), null);
});

test('buildPublicArticlesPostHandler returns 400 with field details for invalid payloads', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(
    makeRequest(
      {
        ...validPayload,
        title: 'short',
        images: ['not-a-valid-url'],
      },
      'top-secret-token',
    ),
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error, 'Validation failed');
  assert.ok(body.details.title.includes('Title must be at least 10 characters'));
  assert.ok(body.details['images.0'].includes('Each image must be a valid absolute URL'));
  assert.equal(getCreatedPayload(), null);
});

test('buildPublicArticlesPostHandler creates a published article and returns 201', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(makeRequest(validPayload, 'top-secret-token'));
  const body = await response.json();
  const createdPayload = getCreatedPayload();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.slug, 'luxury-airport-transfer-jakarta-guide');
  assert.equal(body.data.url, '/blog/luxury-airport-transfer-jakarta-guide');
  assert.ok(createdPayload);
  assert.equal(createdPayload?.isPublished, true);
  assert.equal(
    createdPayload?.publishedAt.toISOString(),
    '2026-04-01T12:00:00.000Z',
  );
});

test('buildPublicArticlesPostHandler resolves duplicate slugs before creation', async () => {
  const checkedSlugs: string[] = [];
  const { deps, getCreatedPayload } = createRouteDeps({
    findPostBySlug: async (slug) => {
      checkedSlugs.push(slug);
      return slug === 'luxury-airport-transfer-jakarta-guide' ? { id: 'existing-post' } : null;
    },
  });
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(makeRequest(validPayload, 'top-secret-token'));
  const createdPayload = getCreatedPayload();

  assert.equal(response.status, 201);
  assert.equal(createdPayload?.slug, 'luxury-airport-transfer-jakarta-guide-1');
  assert.deepEqual(checkedSlugs, [
    'luxury-airport-transfer-jakarta-guide',
    'luxury-airport-transfer-jakarta-guide-1',
  ]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:public-article-api
```

Expected: FAIL with a module resolution error for `@/app/api/public/articles/route` because the route file does not exist yet.

- [ ] **Step 3: Write the route handler**

Create `src/app/api/public/articles/route.ts`.

```ts
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  createPublishedArticleData,
  formatValidationErrors,
  normalizeSlugCandidate,
  parsePublicArticleInput,
  resolveUniqueSlug,
  type PublicArticleCreateData,
} from '@/lib/blog-public-api';

interface CreatedPublicArticleRecord {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: Date | null;
}

export interface PublicArticleRouteDeps {
  articleApiToken?: string;
  now?: () => Date;
  findPostBySlug: (slug: string) => Promise<{ id: string } | null>;
  createPost: (data: PublicArticleCreateData) => Promise<CreatedPublicArticleRecord>;
}

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export function buildPublicArticlesPostHandler(deps: PublicArticleRouteDeps) {
  return async function POST(request: Request): Promise<Response> {
    if (!deps.articleApiToken) {
      return Response.json(
        {
          success: false,
          error: 'ARTICLE_API_TOKEN is not configured on the server',
        },
        { status: 500 },
      );
    }

    const bearerToken = extractBearerToken(request.headers.get('Authorization'));

    if (bearerToken !== deps.articleApiToken) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: {
            body: ['Request body must be valid JSON'],
          },
        },
        { status: 400 },
      );
    }

    try {
      const input = parsePublicArticleInput(body);
      const slugBase = normalizeSlugCandidate(input.slug ?? input.title);
      const slug = await resolveUniqueSlug(
        slugBase,
        async (candidate) => Boolean(await deps.findPostBySlug(candidate)),
      );
      const post = await deps.createPost(
        createPublishedArticleData(input, slug, deps.now ? deps.now() : new Date()),
      );

      return Response.json(
        {
          success: true,
          message: 'Article published successfully',
          data: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            isPublished: post.isPublished,
            publishedAt: post.publishedAt,
            url: `/blog/${post.slug}`,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            success: false,
            error: 'Validation failed',
            details: formatValidationErrors(error),
          },
          { status: 400 },
        );
      }

      console.error('Error publishing article via public API:', error);

      return Response.json(
        {
          success: false,
          error: 'Failed to publish article',
        },
        { status: 500 },
      );
    }
  };
}

export const POST = buildPublicArticlesPostHandler({
  articleApiToken: process.env.ARTICLE_API_TOKEN,
  now: () => new Date(),
  findPostBySlug: async (slug) =>
    prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    }),
  createPost: async (data) =>
    prisma.blogPost.create({
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        publishedAt: true,
      },
    }),
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
npm run test:public-article-api
```

Expected: PASS with 9 passing tests in `src/test/public-article-api.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/public/articles/route.ts src/test/public-article-api.test.ts
git commit -m "feat: add public article publish endpoint"
```

### Task 3: Write External Operator Documentation

**Files:**
- Create: `docs/PUBLIC_ARTICLE_API.md`

- [ ] **Step 1: Write the API usage guide**

Create `docs/PUBLIC_ARTICLE_API.md`.

````md
# Public Article API

## Overview

Use this endpoint when your external AI agent needs to publish a new blog article directly into the ZBK website.

- Endpoint: `POST /api/public/articles`
- Auth: `Authorization: Bearer <ARTICLE_API_TOKEN>`
- Content-Type: `application/json`
- Behavior: articles are published immediately

## Required Environment Variable

Set this on the server before using the endpoint:

```env
ARTICLE_API_TOKEN=replace-with-a-long-random-secret
```

## Request Headers

```http
Authorization: Bearer YOUR_ARTICLE_API_TOKEN
Content-Type: application/json
```

## Minimal Request Body

```json
{
  "title": "Luxury Airport Transfer Jakarta Guide",
  "excerpt": "Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.",
  "content": "# Luxury Airport Transfer Jakarta\n\nTulis artikel lengkap dalam format Markdown dengan beberapa paragraf yang benar-benar informatif."
}
```

## Ideal Request Body

```json
{
  "title": "Luxury Airport Transfer Jakarta Guide",
  "excerpt": "Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.",
  "content": "# Luxury Airport Transfer Jakarta\n\n## Mengapa layanan premium penting\n\nJelaskan konteks pembaca.\n\n## Cara memilih penyedia yang tepat\n\nUraikan poin-poin praktis.\n\n## Kesalahan umum yang perlu dihindari\n\nTutup dengan ringkasan dan ajakan tindakan yang relevan.",
  "author": "ZBK AI Writer",
  "tags": ["airport transfer", "jakarta", "luxury transport"],
  "images": ["https://example.com/cover.jpg"],
  "slug": "luxury-airport-transfer-jakarta-guide"
}
```

## Field Rules

- `title`: required, 10-160 characters
- `excerpt`: required, 50-300 characters
- `content`: required Markdown, minimum 200 characters
- `author`: optional, default `ZBK AI Writer`
- `tags`: optional, max 10 items, each up to 40 characters
- `images`: optional, max 5 URLs, must start with `http://` or `https://`
- `slug`: optional, auto-generated when omitted

## cURL Example

```bash
curl -X POST "https://your-domain.com/api/public/articles" \
  -H "Authorization: Bearer YOUR_ARTICLE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Airport Transfer Jakarta Guide",
    "excerpt": "Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.",
    "content": "# Luxury Airport Transfer Jakarta\n\nArtikel lengkap Markdown di sini.",
    "author": "ZBK AI Writer",
    "tags": ["airport transfer", "jakarta", "luxury transport"],
    "images": ["https://example.com/cover.jpg"]
  }'
```

## JavaScript Example

```ts
const response = await fetch('https://your-domain.com/api/public/articles', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.ARTICLE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Luxury Airport Transfer Jakarta Guide',
    excerpt:
      'Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.',
    content: '# Luxury Airport Transfer Jakarta\n\nArtikel lengkap Markdown di sini.',
    author: 'ZBK AI Writer',
    tags: ['airport transfer', 'jakarta', 'luxury transport'],
    images: ['https://example.com/cover.jpg'],
  }),
});

const payload = await response.json();
console.log(payload);
```

## Success Response

```json
{
  "success": true,
  "message": "Article published successfully",
  "data": {
    "id": "post-1",
    "title": "Luxury Airport Transfer Jakarta Guide",
    "slug": "luxury-airport-transfer-jakarta-guide",
    "isPublished": true,
    "publishedAt": "2026-04-01T12:00:00.000Z",
    "url": "/blog/luxury-airport-transfer-jakarta-guide"
  }
}
```

## Validation Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": ["Title must be at least 10 characters"],
    "images.0": ["Each image must be a valid absolute URL"]
  }
}
```

## Unauthorized Response

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Prompt Template For Your AI

Use a prompt like this in your automation:

```text
Write a complete blog article in Bahasa Indonesia for a luxury transport website.

Return valid JSON only with this shape:
{
  "title": string,
  "excerpt": string,
  "content": string,
  "author": "ZBK AI Writer",
  "tags": string[],
  "images": string[]
}

Rules:
- Title must be specific and natural, not clickbait
- Excerpt must summarize the reader value in 1-2 sentences
- Content must be Markdown with headings and real paragraphs
- Minimum content length: 200 characters
- Avoid placeholders such as TBD, [insert image], lorem ipsum, or generic filler
- Use 3-8 relevant tags
- Only use public image URLs if images are included
```

## Quality Checklist

Before sending the article:

- Title is specific and readable
- Excerpt clearly states the benefit to the reader
- Content is Markdown, not HTML
- Content has headings and meaningful paragraphs
- Tags are relevant and not repetitive
- Image URLs are public and stable
- No placeholders or unfinished text remain

## Troubleshooting

- `401 Unauthorized`: the bearer token is missing or incorrect
- `400 Validation failed`: one or more fields do not match the required format
- `500 ARTICLE_API_TOKEN is not configured on the server`: add the environment variable on the deployed server
- `500 Failed to publish article`: inspect the server logs for unexpected persistence failures
````

- [ ] **Step 2: Verify the documentation includes all required operator sections**

Run:

```bash
Select-String -Path docs/PUBLIC_ARTICLE_API.md -Pattern 'ARTICLE_API_TOKEN|cURL Example|JavaScript Example|Prompt Template For Your AI|Quality Checklist|Troubleshooting'
```

Expected: output lines for each required section so the guide is not missing the core operational content.

- [ ] **Step 3: Commit**

```bash
git add docs/PUBLIC_ARTICLE_API.md
git commit -m "docs: add public article api usage guide"
```

### Task 4: Verify The Finished Feature End To End

**Files:**
- Modify: none unless verification reveals a defect

- [ ] **Step 1: Run the automated tests**

Run:

```bash
npm run test:public-article-api
```

Expected: PASS with all 9 tests green.

- [ ] **Step 2: Run a focused static check**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Run a focused lint check**

Run:

```bash
npx eslint src/app/api/public/articles/route.ts src/lib/blog-public-api.ts src/test/public-article-api.test.ts
```

Expected: PASS with no lint errors.

- [ ] **Step 4: Start the development server with a local token**

Run:

```powershell
$env:ARTICLE_API_TOKEN='local-public-article-token'
npm run dev
```

Expected: Next.js dev server starts locally without route compilation errors.

- [ ] **Step 5: Verify the success path manually**

In a second terminal, run:

```powershell
curl.exe -X POST "http://localhost:3000/api/public/articles" `
  -H "Authorization: Bearer local-public-article-token" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Luxury Airport Transfer Jakarta Guide\",\"excerpt\":\"Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.\",\"content\":\"# Luxury Airport Transfer Jakarta\n\nArtikel ini menjelaskan cara memilih layanan transportasi premium dengan armada yang nyaman, reputasi yang baik, dan proses reservasi yang rapi untuk kebutuhan perjalanan harian maupun tamu bisnis.\",\"tags\":[\"airport transfer\",\"jakarta\",\"luxury transport\"],\"images\":[\"https://example.com/cover.jpg\"]}"
```

Expected: `201 Created` with JSON containing `success: true`, a stable `slug`, `isPublished: true`, and a `url` under `/blog/...`.

- [ ] **Step 6: Verify the unauthorized path manually**

Run:

```powershell
curl.exe -X POST "http://localhost:3000/api/public/articles" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Luxury Airport Transfer Jakarta Guide\",\"excerpt\":\"Panduan praktis memilih layanan airport transfer premium di Jakarta untuk perjalanan yang aman, nyaman, dan tepat waktu.\",\"content\":\"# Luxury Airport Transfer Jakarta\n\nArtikel ini menjelaskan cara memilih layanan transportasi premium dengan armada yang nyaman, reputasi yang baik, dan proses reservasi yang rapi untuk kebutuhan perjalanan harian maupun tamu bisnis.\"}"
```

Expected: `401 Unauthorized` with JSON containing `success: false` and `error: "Unauthorized"`.

- [ ] **Step 7: Commit any final fixes discovered during verification**

Only run this step if Task 4 uncovered code changes that were not already committed.

```bash
git add src/app/api/public/articles/route.ts src/lib/blog-public-api.ts src/test/public-article-api.test.ts docs/PUBLIC_ARTICLE_API.md package.json
git commit -m "chore: finalize public article api verification fixes"
```
