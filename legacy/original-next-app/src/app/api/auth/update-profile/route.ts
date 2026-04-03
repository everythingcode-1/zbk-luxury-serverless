import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function PATCH(request: NextRequest) {
  try {
    // Get token from cookie
    let token = request.cookies.get('auth-token')?.value

    // If no cookie token, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'zbk-luxury-secret-key-2024')
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 })
    }

    const { email, currentPassword, newPassword, name } = await request.json()

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          success: false,
          message: 'Current password is required'
        }, { status: 400 })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({
          success: false,
          message: 'Current password is incorrect'
        }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {}

    // Update email if provided and different
    if (email && email !== user.email) {
      // Check if email already exists
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists && emailExists.id !== user.id) {
        return NextResponse.json({
          success: false,
          message: 'Email already exists'
        }, { status: 400 })
      }

      updateData.email = email
    }

    // Update password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      updateData.password = hashedPassword
    }

    // Update name if provided
    if (name) {
      updateData.name = name
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile'
    }, { status: 500 })
  }
}

