export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  images: string[]; // Changed to array for multiple images support
  author: string; // Simplified to string to match database
  tags: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  readingTime?: number; // Optional, calculated on frontend
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  bio: string;
  social: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  postCount: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  categories: BlogCategory[];
  featuredPosts: BlogPost[];
}
