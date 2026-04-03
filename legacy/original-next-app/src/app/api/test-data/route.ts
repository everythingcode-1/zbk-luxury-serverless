import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/test-data - Create test data for vehicle, booking, and blog
export async function POST() {
  try {
    // Test connection
    await prisma.$connect()
    
    // 1. Create test vehicle
    const testVehicle = await prisma.vehicle.create({
      data: {
        name: 'Toyota Alphard Executive Test',
        model: 'Alphard',
        year: 2024,
        status: 'AVAILABLE',
        location: 'Singapore',
        plateNumber: 'SGX-TEST-001',
        capacity: 6,
        luggage: 4,
        color: 'Pearl White',
        price: 60.00,
        priceAirportTransfer: 80.00,
        pricePerHour: 60.00,
        price6Hours: 360.00,
        price12Hours: 720.00,
        services: ['AIRPORT_TRANSFER', 'TRIP', 'RENTAL'],
        minimumHours: 6,
        purchaseDate: new Date('2024-01-15'),
        purchasePrice: 150000.00,
        mileage: '2500 km',
        features: ['Leather Seats', 'Premium Audio', 'Captain Seats', 'WiFi'],
        images: ['/4.-alphard-colors-black.png'],
        description: 'Luxury Toyota Alphard test vehicle for system validation. All services available.'
      }
    })

    // 2. Create test booking
    const testBooking = await prisma.booking.create({
      data: {
        customerName: 'Test Customer',
        customerEmail: 'test@zbkluxury.com',
        customerPhone: '+6281234567890',
        vehicleId: testVehicle.id,
        service: 'Rental - 12 Hours',
        serviceType: 'RENTAL',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-15'),
        startTime: '08:00',
        duration: '12 hours',
        pickupLocation: 'Marina Bay Sands',
        dropoffLocation: 'Marina Bay Sands',
        totalAmount: 792.00, // SGD 720 + 10% tax
        status: 'CONFIRMED',
        notes: 'Test booking for system validation. 12 hours rental package.'
      }
    })

    // 3. Create test blog post
    const testBlogPost = await prisma.blogPost.create({
      data: {
        title: 'The Ultimate Guide to Luxury Wedding Transportation in Jakarta',
        slug: 'ultimate-guide-luxury-wedding-transportation-jakarta',
        excerpt: 'Discover how to choose the perfect luxury vehicle for your special wedding day in Jakarta. Complete guide with tips and recommendations.',
        content: `# The Ultimate Guide to Luxury Wedding Transportation in Jakarta

Planning a wedding in Jakarta? Transportation is one of the most important aspects that can make or break your special day. Here's everything you need to know about luxury wedding transportation.

## Why Choose Luxury Transportation?

Your wedding day is one of the most important days of your life. Every detail matters, including how you arrive at your venue. Luxury transportation not only provides comfort but also adds elegance and style to your special day.

## Top Vehicle Options

### Toyota Alphard Executive
- **Capacity**: 7 passengers
- **Features**: Leather seats, sunroof, premium audio
- **Perfect for**: Bride and groom, immediate family

### Mercedes S-Class
- **Capacity**: 4 passengers  
- **Features**: Luxury interior, smooth ride
- **Perfect for**: VIP guests, parents

## Booking Tips

1. **Book Early**: Popular dates fill up quickly
2. **Consider Traffic**: Jakarta traffic can be unpredictable
3. **Plan Routes**: Know your pickup and drop-off locations
4. **Backup Plans**: Always have a contingency plan

## ZBK Luxury Services

At ZBK Luxury, we specialize in providing premium transportation services for weddings and special events. Our fleet includes:

- Toyota Alphard Executive
- Mercedes S-Class
- BMW X7
- Audi A8

Contact us today to make your wedding transportation dreams come true!`,
        images: ['/api/placeholder/800/600'], // Changed to array
        author: 'ZBK Luxury Team',
        isPublished: true,
        tags: ['wedding', 'luxury', 'jakarta', 'transportation', 'guide'],
        publishedAt: new Date()
      }
    })

    // Get final stats
    const stats = {
      vehicles: await prisma.vehicle.count(),
      bookings: await prisma.booking.count(),
      blogPosts: await prisma.blogPost.count(),
      users: await prisma.user.count()
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        vehicle: {
          id: testVehicle.id,
          name: testVehicle.name,
          plateNumber: testVehicle.plateNumber
        },
        booking: {
          id: testBooking.id,
          customerName: testBooking.customerName,
          service: testBooking.service,
          status: testBooking.status
        },
        blogPost: {
          id: testBlogPost.id,
          title: testBlogPost.title,
          slug: testBlogPost.slug,
          isPublished: testBlogPost.isPublished
        }
      },
      stats
    })
  } catch (error) {
    console.error('Error creating test data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/test-data - Get current database stats
export async function GET() {
  try {
    const stats = {
      vehicles: await prisma.vehicle.count(),
      bookings: await prisma.booking.count(),
      blogPosts: await prisma.blogPost.count(),
      users: await prisma.user.count()
    }

    // Get latest entries for verification
    const latestVehicle = await prisma.vehicle.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, plateNumber: true, createdAt: true }
    })

    const latestBooking = await prisma.booking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { vehicle: { select: { name: true } } }
    })

    const latestBlogPost = await prisma.blogPost.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, isPublished: true, createdAt: true }
    })

    return NextResponse.json({
      success: true,
      stats,
      latest: {
        vehicle: latestVehicle,
        booking: latestBooking,
        blogPost: latestBlogPost
      }
    })
  } catch (error) {
    console.error('Error fetching test data stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
