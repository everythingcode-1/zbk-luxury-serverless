import { prisma } from '@/lib/prisma';
import { renderEditorJSBlocks } from '@/utils/editorjs-renderer';
import type { OutputData } from '@editorjs/editorjs';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';
  
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 50 // Limit to 50 most recent posts
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>ZBK Limousine Tours Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Expert advice on luxury car rentals, Singapore travel tips, and premium vehicle reviews from ZBK Limousine Tours.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>ZBK Limousine Tours</title>
      <link>${baseUrl}</link>
    </image>
${posts.map(post => {
  const pubDate = post.publishedAt || post.createdAt;
  const imageUrl = post.images && post.images.length > 0 ? `${baseUrl}${post.images[0]}` : '';
  
  // Render content
  let contentHtml = '';
  try {
    const parsed = JSON.parse(post.content) as OutputData;
    if (parsed.blocks) {
      contentHtml = renderEditorJSBlocks(parsed);
    } else {
      contentHtml = post.content;
    }
  } catch {
    contentHtml = post.content;
  }

  return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
      <dc:creator><![CDATA[${post.author}]]></dc:creator>
      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
      ${post.tags && post.tags.length > 0 ? post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') : ''}
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg"/>` : ''}
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}
