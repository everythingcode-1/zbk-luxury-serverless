import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This endpoint ensures admin@zbkluxury.com exists with correct password
export async function POST(request: NextRequest) {
  try {
    const email = 'admin@zbkluxury.com'
    const password = 'ZBKAdmin2024!'
    const name = 'ZBK Admin'

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    let user
    let action = ''

    if (existingUser) {
      // Update existing user
      user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name,
          role: 'ADMIN'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      action = 'updated'
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name,
          role: 'ADMIN'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })
      action = 'created'
    }

    // Get the user again with password to verify
    const userWithPassword = await prisma.user.findUnique({
      where: { email },
      select: { password: true }
    })
    
    // Verify password works
    const passwordValid = userWithPassword ? await bcrypt.compare(password, userWithPassword.password) : false
    
    return NextResponse.json({
      success: true,
      message: `Admin user ${action} successfully`,
      action,
      passwordValid,
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error ensuring admin user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to ensure admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check admin status
export async function GET() {
  try {
    const email = 'admin@zbkluxury.com'
    const password = 'ZBKAdmin2024!'

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        exists: false,
        message: 'Admin user does not exist'
      })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      success: true,
      exists: true,
      passwordValid,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Error checking admin user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

