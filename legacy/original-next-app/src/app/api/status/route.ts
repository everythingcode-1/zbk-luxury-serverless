import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    server: 'running',
    database: 'disconnected',
    apis: {
      vehicles: 'mock_data',
      bookings: 'mock_data', 
      blog: 'mock_data',
      settings: 'mock_data'
    },
    features: {
      vehicle_crud: true,
      booking_management: true,
      blog_management: true,
      image_upload: true,
      email_notifications: false // Requires SMTP setup
    },
    setup_required: [
      'Database connection (PostgreSQL)',
      'Environment variables (.env.local)',
      'Prisma client generation',
      'Database migration',
      'SMTP configuration for emails'
    ]
  }

  try {
    // Test database connection
    await prisma.$connect()
    
    // Test if tables exist by counting records
    const vehicleCount = await prisma.vehicle.count()
    const bookingCount = await prisma.booking.count()
    const blogCount = await prisma.blogPost.count()
    
    status.database = 'connected'
    status.apis = {
      vehicles: vehicleCount > 0 ? 'database' : 'database_empty',
      bookings: bookingCount > 0 ? 'database' : 'database_empty',
      blog: blogCount > 0 ? 'database' : 'database_empty',
      settings: 'database'
    }
    status.setup_required = [
      'SMTP configuration for emails (optional)'
    ]
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.log('Database connection failed, using mock data')
    // Keep default status (disconnected with mock data)
  }

  return NextResponse.json(status)
}
