import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Create or update default admin users
    const adminUsers = [
      {
        email: 'admin@zbkluxury.com',
        password: 'ZBKAdmin2024!',
        name: 'ZBK Admin'
      },
      {
        email: 'test@zbkluxury.com',
        password: 'TestAdmin123!',
        name: 'Test Admin'
      }
    ]

    const processedUsers = []

    for (const userData of adminUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      // Use upsert to create or update admin user
      const admin = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: 'ADMIN'
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
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

      processedUsers.push(admin)
    }

    return NextResponse.json({
      success: true,
      message: 'Admin users setup successfully',
      data: processedUsers
    })

  } catch (error) {
    console.error('Error setting up admin users:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to setup admin users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check if admin exists
export async function GET() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    return NextResponse.json({
      success: true,
      adminExists: adminCount > 0,
      adminCount
    })

  } catch (error) {
    console.error('Error checking admin users:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check admin users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
