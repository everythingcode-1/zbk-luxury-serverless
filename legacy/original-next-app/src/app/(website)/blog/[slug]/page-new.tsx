import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlogCard from '@/components/molecules/BlogCard';
import Breadcrumb from '@/components/molecules/Breadcrumb';
import { getImagePath } from '@/utils/imagePath';
import { renderEditorJSBlocks } from '@/utils/editorjs-renderer';
import type { OutputData } from '@editorjs/editorjs';
import '@/styles/blog.css';

// Get blog post from database
async function getBlogPost(slug: string) {
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

    // Calculate reading time
    const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      ...post,
      readingTime,
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Get related posts
async function getRelatedPosts(currentPostId: string, tags: string[], limit = 3) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        id: { not: currentPostId },
        isPublished: true,
        OR: tags.length > 0 ? [
          { tags: { hasSome: tags } }
        ] : undefined
      },
      take: limit,
      orderBy: {
        publishedAt: 'desc'
      }
    });

    return posts.map(post => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, post.tags || []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render content based on format
  const renderContent = () => {
    if (typeof post.content === 'string') {
      try {
        const parsed = JSON.parse(post.content) as OutputData;
        if (parsed.blocks) {
          return renderEditorJSBlocks(parsed);
        }
      } catch {
        // Not JSON, return as HTML
      }
      return post.content;
    }
    return '<p>No content available</p>';
  };

  return (
    <div className="min-h-screen bg-off-white">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Blog', href: '/blog' },
          { label: post.tags && post.tags.length > 0 ? post.tags[0].replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Article', href: `/blog?tag=${post.tags?.[0] || ''}` },
          { label: post.title }
        ]}
      />

      {/* Article Header */}
      <article className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Category and Reading Time */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-luxury-gold text-deep-navy text-sm font-semibold rounded-full">
              {post.tags && post.tags.length > 0 ? post.tags[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Luxury Transport'}
            </span>
            <div className="flex items-center space-x-4 text-gray-500 text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {post.readingTime} min read
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {post.author}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold text-deep-navy mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Article Meta */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Published on {formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wide font-semibold">Article</span>
              </div>
            </div>
          </div>

          {/* Cover Image (First image) */}
          {post.images && post.images.length > 0 && post.images[0] && (
            <div className="mb-16 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              <Image
                src={getImagePath(post.images[0])}
                alt={post.title}
                width={1200}
                height={600}
                className="object-cover w-full h-auto"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="blog-content prose prose-lg max-w-none mb-12 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderContent() }}
          />

          {/* Additional Images Gallery */}
          {post.images && post.images.length > 1 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-deep-navy mb-6">Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.images.slice(1).map((image, index) => (
                  <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-gray-100 group">
                    <Image
                      src={getImagePath(image)}
                      alt={`${post.title} - Image ${index + 2}`}
                      width={600}
                      height={400}
                      className="object-cover w-full h-auto transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-12 pb-12 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-deep-navy mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blog?tag=${tag}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-luxury-gold hover:text-deep-navy transition-colors duration-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="mb-16 p-8 bg-gray-50 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center text-deep-navy font-bold text-xl">
                {post.author.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-deep-navy mb-2">{post.author}</h3>
                <p className="text-gray-600">
                  Expert writer at ZBK Limousine Tours, sharing insights about luxury transportation, travel tips, and premium vehicle services in Singapore.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-deep-navy mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
            Ready to Experience Luxury?
          </h2>
          <p className="text-lg text-deep-navy mb-8 opacity-80">
            Book your premium limousine service today
          </p>
          <Link
            href="/booking"
            className="inline-block px-8 py-4 bg-deep-navy text-white rounded-compact hover:bg-charcoal transition-colors duration-300 font-semibold text-lg"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}
