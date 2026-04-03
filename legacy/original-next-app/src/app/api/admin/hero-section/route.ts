import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/hero-section - Get all hero sections
export async function GET(request: NextRequest) {
  try {
    const heroSections = await prisma.heroSection.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(heroSections)
  } catch (error) {
    console.error('Error fetching hero sections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero sections' },
      { status: 500 }
    )
  }
}

// POST /api/admin/hero-section - Create new hero section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { headline, description, image, isActive } = body

    if (!headline || !description) {
      return NextResponse.json(
        { error: 'Headline and description are required' },
        { status: 400 }
      )
    }

    // If setting as active, deactivate all other hero sections
    if (isActive) {
      await prisma.heroSection.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    const heroSection = await prisma.heroSection.create({
      data: {
        headline,
        description,
        image: image || null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(heroSection, { status: 201 })
  } catch (error) {
    console.error('Error creating hero section:', error)
    return NextResponse.json(
      { error: 'Failed to create hero section' },
      { status: 500 }
    )
  }
}

