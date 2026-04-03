'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { getImagePath } from '@/utils/imagePath';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (featured) {
    return (
      <article className="group relative bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <Link href={`/blog/${post.slug}`}>
          <div className="aspect-w-16 aspect-h-9 relative">
            <Image
              src={getImagePath(post.images?.[0])}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/api/uploads/')) {
                  target.src = post.images?.[0] || '/4.-alphard-colors-black.png';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-block px-3 py-1 bg-luxury-gold text-deep-navy text-xs font-semibold rounded-full">
                  {post.tags && post.tags.length > 0 ? post.tags[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Blog'}
                </span>
                <span className="text-white text-sm">
                  {post.readingTime} min read
                </span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-200 text-sm line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </div>
        </Link>
        
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-500">
                {formatDate(post.publishedAt)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-w-16 aspect-h-10 relative">
          <Image
            src={post.images?.[0] || '/4.-alphard-colors-black.png'}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="inline-block px-3 py-1 bg-luxury-gold bg-opacity-10 text-luxury-gold text-xs font-semibold rounded-full">
            {post.tags && post.tags.length > 0 ? post.tags[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Blog'}
          </span>
          <span className="text-gray-500 text-sm">
            {Math.ceil((post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 100) / 200)} min read
          </span>
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-bold text-deep-navy mb-2 line-clamp-2 group-hover:text-luxury-gold transition-colors">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <p className="text-xs text-gray-500">
              {formatDate(post.publishedAt)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
