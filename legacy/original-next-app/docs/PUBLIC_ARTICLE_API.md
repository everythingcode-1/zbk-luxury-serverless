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
- `slug`: optional, auto-generated when omitted or blank

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
