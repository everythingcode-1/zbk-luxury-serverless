import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Fetch blog posts from database
async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return posts.map(post => ({
      slug: post.slug,
      updatedAt: post.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    // Return empty array if database error
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date('2025-03-01'),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/fleet`,
      lastModified: new Date('2025-02-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date('2025-02-15'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-to-book`,
      lastModified: new Date('2025-02-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2025-03-01'),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Dynamic blog pages
  const blogPosts = await getBlogPosts();
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
