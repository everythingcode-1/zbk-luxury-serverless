# Public Article API Design

## Summary

This design adds a dedicated public write endpoint for AI-driven article publishing without introducing full user authentication. The endpoint stays internet-accessible, but write access is restricted with a shared bearer token so only the intended automation can publish articles.

The implementation will reuse the existing `BlogPost` Prisma model and keep the current admin blog flow intact. The new endpoint will provide a stable contract, strict validation, predictable responses, and usage documentation focused on AI-generated content quality.

## Goals

- Provide a dedicated public API endpoint for publishing blog articles from an external AI workflow.
- Require a simple shared secret token in the request header instead of user login.
- Publish articles automatically on successful creation.
- Enforce a clean, stable payload contract with clear validation errors.
- Generate a unique slug automatically when it is omitted or conflicts with an existing post.
- Document how the API should be used so AI-generated results are consistently high quality.

## Non-Goals

- Full user authentication, sessions, or role-based authorization.
- File upload handling for article images.
- Scheduling future publication dates.
- Updating or deleting articles through the public endpoint.
- Refactoring the existing admin blog interface or its API behavior beyond shared helper reuse if needed.

## Current Project Context

- The project is a Next.js App Router application with API routes under `src/app/api`.
- Blog posts are already stored in the `BlogPost` Prisma model with fields for title, slug, excerpt, content, images, author, publication state, and tags.
- The existing `POST /api/blog` route currently allows article creation without authentication, but it lacks a stable external contract, robust validation, and dedicated documentation for automation.
- The admin interface under `src/app/admin/blog/page.tsx` already consumes the current blog APIs and should remain unaffected by the new public ingest path.

## Proposed API Design

### Endpoint

- Method: `POST`
- Path: `/api/public/articles`

This route is intentionally separate from `/api/blog` so the AI ingest contract can evolve independently from the admin-facing endpoints.

### Authentication Model

- Required header: `Authorization: Bearer <ARTICLE_API_TOKEN>`
- The token value is stored in the environment variable `ARTICLE_API_TOKEN`.
- Requests without the header, with malformed bearer format, or with a mismatched token return `401 Unauthorized`.
- If `ARTICLE_API_TOKEN` is missing from server configuration, the endpoint returns `500 Internal Server Error` with a clear configuration message that does not leak secrets.

This is not user authentication. It is a shared-secret write gate appropriate for server-to-server automation.

### Request Content Type

- Required header: `Content-Type: application/json`
- The request body must be JSON.

### Request Payload Contract

```json
{
  "title": "Luxury Airport Transfer Jakarta: 7 Tips Memilih Layanan yang Tepat",
  "excerpt": "Panduan singkat memilih layanan airport transfer premium di Jakarta agar perjalanan lebih aman, nyaman, dan tepat waktu.",
  "content": "# Luxury Airport Transfer Jakarta\n\nIsi artikel lengkap dalam format Markdown.",
  "author": "ZBK AI Writer",
  "tags": ["airport transfer", "jakarta", "luxury transport"],
  "images": ["https://example.com/cover.jpg"],
  "slug": "luxury-airport-transfer-jakarta-7-tips"
}
```

### Field Rules

- `title`
  - Required
  - String
  - Trimmed before validation
  - Length: 10-160 characters
- `excerpt`
  - Required
  - String
  - Trimmed before validation
  - Length: 50-300 characters
- `content`
  - Required
  - String in Markdown format
  - Trimmed before validation
  - Minimum length: 200 characters
- `author`
  - Optional
  - String
  - Defaults to `ZBK AI Writer`
  - Length after normalization: 1-80 characters when provided
- `tags`
  - Optional
  - Array of strings
  - Empty and duplicate values are removed
  - Maximum 10 items after normalization
  - Each item is trimmed
  - Each item length after normalization: 1-40 characters
- `images`
  - Optional
  - Array of strings
  - Maximum 5 items
  - Each item must be a valid absolute `http` or `https` URL
  - Each URL length: maximum 2048 characters
- `slug`
  - Optional
  - String
  - If absent or blank, generated from `title`
  - If provided, normalized into the same slug format used for generated slugs
  - Maximum source length before normalization: 160 characters

### Unknown Fields

- The request schema should be strict.
- Unexpected top-level keys should be rejected with a validation error instead of being silently ignored.

### Publication Behavior

- Articles created through this endpoint are always published immediately.
- The server will store:
  - `isPublished = true`
  - `publishedAt = new Date()`
- The endpoint will not accept draft creation behavior. This keeps the contract simple and aligned with the user's stated workflow.

## Normalization Rules

Before persistence, the server will normalize input data:

- Trim whitespace from string fields.
- Remove empty strings from `tags` and `images`.
- Deduplicate `tags` and `images` while preserving order of first appearance.
- Normalize slug candidates to lowercase kebab-case.
- Fallback author to `ZBK AI Writer` when omitted or blank.

## Slug Generation Strategy

- Use the provided `slug` when present, otherwise generate from `title`.
- Normalize slug to lowercase kebab-case:
  - convert to lowercase
  - replace non-alphanumeric runs with `-`
  - collapse repeated separators
  - strip leading and trailing hyphens
- If the normalized slug already exists in `BlogPost.slug`, append incremental suffixes:
  - `example-title`
  - `example-title-1`
  - `example-title-2`

This behavior must be deterministic so the caller receives a final stable slug in the response.

## Persistence Model

The endpoint will write directly to the existing Prisma `BlogPost` model:

- `title`
- `slug`
- `excerpt`
- `content`
- `images`
- `author`
- `tags`
- `isPublished`
- `publishedAt`

No Prisma schema change is required for this feature.

## Response Contract

### Success Response

- Status: `201 Created`

```json
{
  "success": true,
  "message": "Article published successfully",
  "data": {
    "id": "cm123example",
    "title": "Luxury Airport Transfer Jakarta: 7 Tips Memilih Layanan yang Tepat",
    "slug": "luxury-airport-transfer-jakarta-7-tips",
    "isPublished": true,
    "publishedAt": "2026-04-01T12:00:00.000Z",
    "url": "/blog/luxury-airport-transfer-jakarta-7-tips"
  }
}
```

### Unauthorized Response

- Status: `401 Unauthorized`

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Validation Failure Response

- Status: `400 Bad Request`

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": ["Title is required"],
    "content": ["Content must be at least 200 characters"]
  }
}
```

### Server Failure Response

- Status: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to publish article"
}
```

The server should log enough information for debugging internally but should not expose token values, stack traces, or database internals in the JSON response.

## Error Handling

- Reject missing or invalid bearer token with `401`.
- Reject malformed JSON or invalid schema with `400`.
- Return field-specific validation details so AI or automation can self-correct.
- Return `500` for unexpected persistence or configuration failures.
- Avoid fallback mock data for this write endpoint. Creation should either succeed or fail explicitly.

## File and Module Design

### New Route

- `src/app/api/public/articles/route.ts`
  - Handles token check
  - Parses JSON body
  - Invokes validation and normalization helpers
  - Persists the article through Prisma
  - Returns stable success and error responses

### Shared Helper Module

- `src/lib/blog-public-api.ts`
  - Zod schema for request payload
  - Normalization helpers
  - Slug normalization helper
  - Unique slug resolution helper

This keeps the route thin and makes validation behavior easy to test.

### Documentation

- `docs/PUBLIC_ARTICLE_API.md`
  - Endpoint overview
  - Required environment variable
  - Header and payload specification
  - Minimal and ideal example payloads
  - `curl` example
  - JavaScript `fetch` example
  - Success and error responses
  - AI prompt and content quality guidance
  - Troubleshooting section

## Validation and Testing Strategy

The implementation should follow test-first development for the new helper logic and route behavior where practical in the current project setup.

### Required Test Coverage

- Missing bearer token returns `401`
- Wrong bearer token returns `401`
- Invalid payload returns `400`
- Valid payload creates a published article and returns `201`
- Blank `slug` generates from `title`
- Duplicate slug gets incremented suffix
- Blank optional values are normalized properly
- Invalid image URLs are rejected

### Suggested Test Scope

- Unit tests for helper functions in `src/lib/blog-public-api.ts`
- Route-level tests for the endpoint behavior if the current test setup supports App Router handlers cleanly

If route-level test infrastructure is not yet present, helper logic should still be covered directly, and manual verification steps should be documented in the implementation plan.

## Documentation Guidance for AI Usage

The usage documentation should optimize for reliable automated content generation:

- Require Markdown for `content`, not raw HTML.
- Recommend article structures with headings, paragraphs, and concise scannable sections.
- Recommend informative, non-clickbait titles.
- Recommend excerpts that summarize the reader value in 1-2 sentences.
- Recommend 3-8 relevant tags.
- Recommend only stable public image URLs.
- Explicitly warn against placeholders such as `TBD`, `[insert image]`, or generic filler text.
- Include a ready-to-use example prompt for the external AI so article output matches the endpoint contract and desired quality bar.

## Compatibility and Migration Impact

- No database migration is required.
- Existing admin blog features remain unchanged.
- Existing `/api/blog` consumers remain unchanged.
- The only required deployment change is adding `ARTICLE_API_TOKEN` to the environment.

## Open Implementation Decisions

These choices are fixed by the current design and should not be re-opened during implementation unless new constraints appear:

- Use a dedicated public endpoint instead of modifying `/api/blog`
- Use bearer token shared secret instead of full authentication
- Publish automatically on create
- Accept Markdown content
- Accept image URLs only, not multipart uploads

## Acceptance Criteria

The feature is complete when all of the following are true:

- `POST /api/public/articles` exists and rejects unauthorized requests.
- Authorized valid requests create `BlogPost` records successfully.
- Created records are immediately published.
- Slugs are normalized and uniquely resolved.
- Invalid payloads produce field-level validation errors.
- Documentation exists and includes examples aimed at external AI usage.
- Verification demonstrates that the endpoint behaves correctly for success and failure cases.
