import type { Metadata } from "next";
import { generateBlogPostSEO, generateStructuredData } from "@/utils/seo";
import { BlogPost } from "@/types/blog";
import { prisma } from "@/lib/prisma";

// Get blog post from database by slug
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        isPublished: true
      }
    });

    if (!post) {
      return null;
    }

    // Convert Prisma date objects to ISO strings
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      images: post.images || [],
      tags: post.tags || [],
      publishedAt: post.publishedAt?.toISOString() || new Date().toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      isPublished: post.isPublished
      // readingTime is calculated on the frontend, not stored in database
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Article Not Found | ZBK Luxury Car Rental Blog',
      description: 'The article you are looking for could not be found.',
    };
  }

  return generateBlogPostSEO(post);
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  return (
    <>
      {children}
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData(post)),
          }}
        />
      )}
    </>
  );
}
