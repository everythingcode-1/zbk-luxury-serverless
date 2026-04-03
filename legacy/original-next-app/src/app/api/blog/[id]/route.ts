import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blog/[id] - Get single blog post by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Try to find by ID first, then by slug
    let post = await prisma.blogPost.findUnique({
      where: { id }
    })

    // If not found by ID, try by slug
    if (!post) {
      post = await prisma.blogPost.findUnique({
        where: { 
          slug: id,
          isPublished: true 
        }
      })
    }

    if (!post) {
      return NextResponse.json({
        success: false,
        error: 'Blog post not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blog post'
    }, { status: 500 })
  }
}

// PUT /api/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Generate slug if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: body.content,
        images: body.images || [], // Changed to array
        author: body.author || 'ZBK Team',
        isPublished: body.isPublished || false,
        tags: body.tags || [],
        publishedAt: body.isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update blog post'
    }, { status: 500 })
  }
}

// DELETE /api/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.blogPost.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete blog post'
    }, { status: 500 })
  }
}
