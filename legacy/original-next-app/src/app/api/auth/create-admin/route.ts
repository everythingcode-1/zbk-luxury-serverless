import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: admin
    })

  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user'
    }, { status: 500 })
  }
}
