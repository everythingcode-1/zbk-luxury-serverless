import { Metadata } from 'next';
import { BlogPost } from '@/types/blog';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    ogImage,
    canonicalUrl,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = []
  } = config;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      type: publishedTime ? 'article' : 'website',
      locale: 'en_US',
      url: fullCanonicalUrl,
      siteName: 'ZBK Luxury Car Rental',
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : undefined,
      publishedTime,
      modifiedTime,
      section,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      creator: author ? `@${author.replace(/\s+/g, '').toLowerCase()}` : undefined,
    },
    alternates: {
      canonical: fullCanonicalUrl,
    },
    other: {
      ...(author && { 'article:author': author }),
      ...(section && { 'article:section': section }),
      ...(publishedTime && { 'article:published_time': publishedTime }),
      ...(modifiedTime && { 'article:modified_time': modifiedTime }),
      ...(tags.length > 0 && { 'article:tag': tags.join(', ') }),
    },
  };
}

export function generateBlogPostSEO(post: BlogPost): Metadata {
  return generateSEOMetadata({
    title: `${post.title} | ZBK Luxury Car Rental Blog`,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      'toyota alphard rental',
      'toyota hiace rental',
      'luxury mpv rental',
      'ZBK luxury'
    ],
    ogImage: post.images?.[0], // Use first image as OG image
    canonicalUrl: `/blog/${post.slug}`,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    author: post.author,
    section: post.tags[0] || 'Blog',
    tags: post.tags,
  });
}

export function generateBlogListSEO(
  page: number = 1,
  category?: string,
  tag?: string
): Metadata {
  let title = 'Blog | ZBK Luxury - Toyota Alphard & Hiace Insights';
  let description = 'Stay updated with the latest Toyota Alphard and Hiace insights, travel tips, and premium vehicle rental guides from ZBK Luxury experts.';
  let canonicalUrl = '/blog';

  if (category) {
    title = `${category} Articles | ZBK Luxury Car Rental Blog`;
    description = `Explore our ${category.toLowerCase()} articles and insights about luxury car rental and premium travel experiences.`;
    canonicalUrl = `/blog/category/${category.toLowerCase()}`;
  }

  if (tag) {
    title = `${tag} Posts | ZBK Luxury Car Rental Blog`;
    description = `Read all posts tagged with ${tag} on ZBK Luxury Car Rental blog.`;
    canonicalUrl = `/blog/tag/${tag.toLowerCase()}`;
  }

  if (page > 1) {
    title = `${title} - Page ${page}`;
    canonicalUrl = `${canonicalUrl}?page=${page}`;
  }

  return generateSEOMetadata({
    title,
    description,
    keywords: [
      'toyota alphard blog',
      'toyota hiace news',
      'luxury mpv rental tips',
      'premium vehicle insights',
      'ZBK luxury',
      'toyota rental guides'
    ],
    canonicalUrl,
  });
}

export function generateStructuredData(post: BlogPost) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.zbktransportservices.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.images?.[0], // Use first image as featured image
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${baseUrl}/blog/author/${post.author.toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ZBK Luxury Car Rental',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo-google.png`
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
    articleSection: post.tags[0] || 'Blog',
    keywords: post.tags.join(', '),
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readingTime}M`,
  };
}
