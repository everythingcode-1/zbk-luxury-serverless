import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zbk-luxury-secret-key-2024'

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookies first
    let token = request.cookies.get('auth-token')?.value
    console.log('Auth check - Cookie token found:', !!token) // Debug log
    
    // If no cookie token, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
        console.log('Auth check - Header token found:', !!token) // Debug log
      }
    }
    
    console.log('All cookies:', request.cookies.getAll()) // Debug log

    if (!token) {
      console.log('No auth token found in cookies or headers') // Debug log
      return NextResponse.json({
        success: false,
        message: 'No authentication token found'
      }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('Error getting user info:', error)
    return NextResponse.json({
      success: false,
      message: 'Invalid or expired token'
    }, { status: 401 })
  }
}
