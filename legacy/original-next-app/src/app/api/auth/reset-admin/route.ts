import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to reset password'
    }, { status: 500 })
  }
}
