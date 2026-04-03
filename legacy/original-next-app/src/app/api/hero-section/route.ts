import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/hero-section - Get active hero section
export async function GET(request: NextRequest) {
  try {
    const heroSection = await prisma.heroSection.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // If no active hero section, return default
    if (!heroSection) {
      return NextResponse.json({
        headline: 'Premium Limousine Service in Singapore',
        description: 'Professional limousine rental services with premium Toyota Alphard & Hiace. Experience luxury limo transportation for airport transfers, city tours, corporate events, and special occasions. Book your elegant ride today.',
        image: '/Hero.jpg'
      })
    }

    return NextResponse.json({
      id: heroSection.id,
      headline: heroSection.headline,
      description: heroSection.description,
      image: heroSection.image || '/Hero.jpg',
      isActive: heroSection.isActive
    })
  } catch (error) {
    console.error('Error fetching hero section:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero section' },
      { status: 500 }
    )
  }
}

