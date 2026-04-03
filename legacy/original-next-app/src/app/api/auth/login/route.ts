import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zbk-luxury-secret-key-2024'

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called') // Debug log
    
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json({
        success: false,
        message: 'Invalid request body'
      }, { status: 400 })
    }

    const { email, password } = body
    console.log('Login attempt for email:', email) // Debug log

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 })
    }

    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connected successfully') // Debug log
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 })
    }

    // Find user by email
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email }
      })
      console.log('User query result:', user ? 'User found' : 'User not found') // Debug log
    } catch (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json({
        success: false,
        message: 'Database query failed',
        error: queryError instanceof Error ? queryError.message : 'Unknown query error'
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }

    // Verify password
    let isValidPassword
    try {
      isValidPassword = await bcrypt.compare(password, user.password)
      console.log('Password verification result:', isValidPassword) // Debug log
    } catch (bcryptError) {
      console.error('Password verification error:', bcryptError)
      return NextResponse.json({
        success: false,
        message: 'Password verification failed',
        error: bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error'
      }, { status: 500 })
    }

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }

    // Generate JWT token
    let token
    try {
      token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      console.log('JWT token generated successfully') // Debug log
    } catch (jwtError) {
      console.error('JWT generation error:', jwtError)
      return NextResponse.json({
        success: false,
        message: 'Token generation failed',
        error: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error'
      }, { status: 500 })
    }

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Disable secure for localhost development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/', // Ensure cookie is available for all paths
      domain: undefined // Let browser handle domain for localhost
    })

    console.log('Login successful, cookie set for user:', user.email) // Debug log

    return response

  } catch (error) {
    console.error('Unexpected error during login:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      }
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}
