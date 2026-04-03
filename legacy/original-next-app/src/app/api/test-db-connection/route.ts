import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
