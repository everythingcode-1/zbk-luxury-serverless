import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hero-section/[id] - Get hero section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const heroSection = await prisma.heroSection.findUnique({
      where: { id }
    })

    if (!heroSection) {
      return NextResponse.json(
        { error: 'Hero section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(heroSection)
  } catch (error) {
    console.error('Error fetching hero section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero section' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/hero-section/[id] - Update hero section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { headline, description, image, isActive } = body

    // Check if hero section exists
    const existingHeroSection = await prisma.heroSection.findUnique({
      where: { id }
    })

    if (!existingHeroSection) {
      return NextResponse.json(
        { error: 'Hero section not found' },
        { status: 404 }
      )
    }

    // If setting as active, deactivate all other hero sections
    if (isActive === true) {
      await prisma.heroSection.updateMany({
        where: {
          isActive: true,
          id: { not: id }
        },
        data: {
          isActive: false
        }
      })
    }

    const heroSection = await prisma.heroSection.update({
      where: { id },
      data: {
        ...(headline && { headline }),
        ...(description && { description }),
        ...(image !== undefined && { image: image || null }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(heroSection)
  } catch (error) {
    console.error('Error updating hero section:', error)
    return NextResponse.json(
      { error: 'Failed to update hero section' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/hero-section/[id] - Delete hero section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if hero section exists
    const existingHeroSection = await prisma.heroSection.findUnique({
      where: { id }
    })

    if (!existingHeroSection) {
      return NextResponse.json(
        { error: 'Hero section not found' },
        { status: 404 }
      )
    }

    await prisma.heroSection.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Hero section deleted successfully' })
  } catch (error) {
    console.error('Error deleting hero section:', error)
    return NextResponse.json(
      { error: 'Failed to delete hero section' },
      { status: 500 }
    )
  }
}

