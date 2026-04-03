import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/blog - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          isPublished: true,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } }
            ]
          })
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.blogPost.count({
        where: {
          isPublished: true,
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } }
            ]
          })
        }
      });

      return NextResponse.json({
        success: true,
        data: posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      });
    } catch (dbError) {
      console.log('Database not available, using fallback:', dbError);
      
      // Fallback mock data
      const mockPosts = [
        {
          id: '1',
          title: 'The Ultimate Guide to Luxury Car Rental in 2024',
          slug: 'ultimate-guide-luxury-car-rental-2024',
          excerpt: 'Discover everything you need to know about renting luxury vehicles.',
          content: 'Full content here...',
          images: ['/api/placeholder/800/600'], // Changed to array
          author: 'ZBK Team',
          publishedAt: new Date('2024-01-15'),
          isPublished: true,
          tags: ['luxury', 'travel', 'guide'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockPosts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPosts: mockPosts.length,
          hasNext: false,
          hasPrev: false
        }
      });
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blog posts'
    }, { status: 500 });
  }
}

// POST /api/blog - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate base slug
    let slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Check if slug already exists and make it unique
    let slugExists = await prisma.blogPost.findUnique({ where: { slug } });
    let counter = 1;
    
    while (slugExists) {
      slug = `${body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
      slugExists = await prisma.blogPost.findUnique({ where: { slug } });
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: slug,
        excerpt: body.excerpt,
        content: body.content,
        images: body.images || [], // Changed to array
        author: body.author || 'ZBK Team',
        isPublished: body.isPublished || false,
        tags: body.tags || [],
        publishedAt: body.isPublished ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      data: post
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create blog post'
    }, { status: 500 });
  }
}
