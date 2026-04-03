import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildPublicArticlesPostHandler,
  type PublicArticleRouteDeps,
} from '../app/api/public/articles/route';
import {
  createPublishedArticleData,
  normalizeSlugCandidate,
  parsePublicArticleInput,
  resolveUniqueSlug,
  type PublicArticleCreateData,
} from '../lib/blog-public-api';

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

test('buildPublicArticlesPostHandler returns 500 when the server token is not configured', async () => {
  const { deps, getCreatedPayload } = createRouteDeps({
    articleApiToken: undefined,
  });
  const handler = buildPublicArticlesPostHandler(deps);

  const response = await handler(makeRequest(validPayload, 'top-secret-token'));

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'ARTICLE_API_TOKEN is not configured on the server',
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

test('buildPublicArticlesPostHandler returns 400 when the request body is not valid JSON', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);
  const response = await handler(
    new Request('http://localhost:3000/api/public/articles', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer top-secret-token',
        'Content-Type': 'application/json',
      },
      body: '{"title": "broken"',
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: 'Validation failed',
    details: {
      body: ['Request body must be valid JSON'],
    },
  });
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

test('buildPublicArticlesPostHandler generates the slug from title when the incoming slug is blank', async () => {
  const { deps, getCreatedPayload } = createRouteDeps();
  const handler = buildPublicArticlesPostHandler(deps);
  const response = await handler(
    makeRequest(
      {
        ...validPayload,
        slug: '   ',
      },
      'top-secret-token',
    ),
  );

  assert.equal(response.status, 201);
  assert.equal(getCreatedPayload()?.slug, 'luxury-airport-transfer-jakarta-guide');
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
