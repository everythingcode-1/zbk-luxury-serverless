'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BlogCard from '@/components/molecules/BlogCard';
import Breadcrumb from '@/components/molecules/Breadcrumb';
import { getImagePath } from '@/utils/imagePath';

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  images?: string[] // Changed to array
  author: string
  isPublished: boolean
  tags: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      // Fetch blog posts from database API
      const response = await fetch('/api/blog');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter published posts and format for display
        const publishedPosts = result.data.filter((post: any) => post.isPublished);
        setBlogPosts(publishedPosts);
      } else {
        console.error('Failed to fetch blog posts:', result.error);
        setBlogPosts([]);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Pagination calculations
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = blogPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Blog', href: '/blog' }
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-deep-navy py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              ZBK Luxury Blog
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover the latest insights about luxury vehicles, premium travel tips, 
              and comprehensive guides from our ZBK Luxury expert team.
            </p>
            <div className="w-24 h-1 bg-luxury-gold mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Articles List Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">Latest Articles</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive guides and insights about luxury vehicles
            </p>
          </div>
          
          {/* Article List */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <article key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <Link href={`/blog/${post.slug}`} className="block group">
                      <div className="flex flex-col md:flex-row">
                        {/* Article Image - Cover */}
                        <div className="md:w-1/3 w-full h-48 md:h-auto relative bg-gray-200">
                          {post.images && post.images.length > 0 && post.images[0] ? (
                            <Image
                              src={getImagePath(post.images[0])}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('/api/uploads/') && post.images?.[0]) {
                                  target.src = post.images[0];
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                              <span className="text-gray-400 text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Article Content */}
                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-3">
                              <span className="inline-block px-3 py-1 bg-luxury-gold text-deep-navy text-xs font-semibold rounded-full">
                                Blog Post
                              </span>
                              <span className="text-gray-500 text-sm">
                                {calculateReadingTime(post.content)} min read
                              </span>
                              <span className="text-gray-500 text-sm">
                                {formatDate(post.publishedAt || post.createdAt)}
                              </span>
                            </div>
                            
                            <h2 className="text-xl font-bold text-deep-navy mb-3 group-hover:text-luxury-gold transition-colors">
                              {post.title}
                            </h2>
                            
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {post.excerpt || 'No excerpt available'}
                            </p>
                            
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.slice(0, 3).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-4">
                            By {typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'ZBK Team'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No blog posts available yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-luxury-gold text-deep-navy border-luxury-gold font-semibold'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-deep-navy mb-4">
            Never Miss an Update
          </h2>
          <p className="text-lg text-deep-navy mb-8 opacity-80">
            Subscribe to our blog newsletter and get the latest luxury vehicle insights delivered directly to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-compact border border-deep-navy border-opacity-20 focus:border-deep-navy focus:outline-none"
            />
            <button className="px-8 py-3 bg-deep-navy text-white rounded-compact hover:bg-charcoal transition-colors duration-300 font-semibold">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm text-deep-navy opacity-60 mt-4">
            Weekly updates, no spam, unsubscribe anytime
          </p>
        </div>
      </section>
    </div>
  );
}
