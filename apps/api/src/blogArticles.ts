import {
  blogArticleResponseSchema,
  blogArticleSchema,
  blogArticlesResponseSchema,
  type BlogArticle,
} from '@zbk/shared';

const rawBlogArticles = [
  {
    id: 'blog-001',
    title: 'Choosing the right vehicle for an airport transfer',
    slug: 'choosing-the-right-vehicle-for-an-airport-transfer',
    excerpt:
      'A practical guide to matching passenger count, luggage, and pickup timing with the right luxury vehicle.',
    content:
      'Airport transfers work best when the vehicle fits both the group size and the luggage footprint. For a private airport run, a compact executive vehicle may be ideal. For families or business teams with multiple suitcases, a larger multi-purpose vehicle keeps the ride calm and comfortable. The new serverless blog page keeps that advice visible while the booking workspace stays connected to the live fleet and quote flow.',
    author: 'ZBK Team',
    isPublished: true,
    tags: ['airport transfer', 'fleet selection', 'travel tips'],
    publishedAt: '2026-04-10T08:00:00.000Z',
    createdAt: '2026-04-08T08:00:00.000Z',
    updatedAt: '2026-04-10T08:00:00.000Z',
    readingMinutes: 3,
  },
  {
    id: 'blog-002',
    title: 'Pickup notes that keep chauffeurs on schedule',
    slug: 'pickup-notes-that-keep-chauffeurs-on-schedule',
    excerpt:
      'Clear pickup and drop-off notes reduce friction for airport meetings, hotel handoffs, and event-day coordination.',
    content:
      'Small details make a big difference in premium transport. Pickup notes can confirm the terminal, hotel lobby, or building entrance. Drop-off notes can mention valet access or event timings. In the legacy app, these details lived deep inside the booking form. The new Workers-backed booking draft already preserves them, and this blog slice now points customers toward the same contract from a public content page.',
    author: 'ZBK Operations',
    isPublished: true,
    tags: ['booking notes', 'operations', 'customer experience'],
    publishedAt: '2026-04-12T08:00:00.000Z',
    createdAt: '2026-04-09T08:00:00.000Z',
    updatedAt: '2026-04-12T08:00:00.000Z',
    readingMinutes: 4,
  },
  {
    id: 'blog-003',
    title: 'Why a serverless booking stack simplifies public pages',
    slug: 'why-a-serverless-booking-stack-simplifies-public-pages',
    excerpt:
      'Hash-routed React pages and shared contracts let the public site move faster without depending on Node-only runtime assumptions.',
    content:
      'The migration is not just about moving code; it is also about shrinking the dependency surface. Public pages like services, fleet, and blog can now render in a static-friendly React app while Workers handle the contracts that used to sit inside Next.js route handlers. That makes each migration slice easier to review and safer to deploy.',
    author: 'ZBK Engineering',
    isPublished: true,
    tags: ['serverless', 'migration', 'react'],
    publishedAt: '2026-04-14T08:00:00.000Z',
    createdAt: '2026-04-13T08:00:00.000Z',
    updatedAt: '2026-04-14T08:00:00.000Z',
    readingMinutes: 3,
  },
] satisfies BlogArticle[];

export const blogArticles = blogArticleSchema.array().parse(rawBlogArticles);

export function findBlogArticleBySlug(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

export function buildBlogArticlesResponse() {
  return blogArticlesResponseSchema.parse({
    message: 'Blog article list migrated into the Workers-backed public content API.',
    data: blogArticles,
    meta: {
      total: blogArticles.length,
      source: 'workers-seed',
      latestPublishedAt: blogArticles[0]?.publishedAt,
    },
  });
}

export function buildBlogArticleResponse(slug: string) {
  const article = findBlogArticleBySlug(slug);

  if (!article) {
    return null;
  }

  return blogArticleResponseSchema.parse({
    message: 'Blog article detail loaded from the Workers-backed public content API.',
    data: article,
    meta: {
      source: 'workers-seed',
      readingMinutes: article.readingMinutes,
    },
  });
}

export function buildBlogRssXml(baseUrl: string) {
  const items = blogArticles
    .filter((article) => article.isPublished)
    .map((article) => {
      const publishedAt = article.publishedAt || article.createdAt;
      const articleUrl = `${baseUrl}/#/blog/${encodeURIComponent(article.slug)}`;
      const content = article.content;
      const tags = article.tags.map((tag) => `      <category><![CDATA[${tag}]]></category>`).join('\n');

      return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="false">${article.id}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      <dc:creator><![CDATA[${article.author}]]></dc:creator>
      <pubDate>${new Date(publishedAt).toUTCString()}</pubDate>${tags ? `\n${tags}` : ''}
    </item>`;
    })
    .join('\n');

  const latestPublishedAt = blogArticles.find((article) => article.isPublished)?.publishedAt || new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>ZBK Luxury Blog</title>
    <link>${baseUrl}/#/blog</link>
    <description>Insights about luxury transport, booking notes, and the migration toward a serverless booking stack.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date(latestPublishedAt).toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/public/articles/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.svg</url>
      <title>ZBK Luxury Blog</title>
      <link>${baseUrl}/#/blog</link>
    </image>
${items}
  </channel>
</rss>`;
}
