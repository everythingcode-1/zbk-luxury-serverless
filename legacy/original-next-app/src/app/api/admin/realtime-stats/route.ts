import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Active bookings (CONFIRMED or IN_PROGRESS)
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      }
    })

    // Today's revenue (from PAID bookings created today)
    const todayBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startOfToday
        },
        paymentStatus: 'PAID'
      },
      select: {
        totalAmount: true
      }
    })

    const todayRevenue = todayBookings.reduce((sum, booking) => 
      sum + (booking.totalAmount || 0), 0
    )

    // Pending approvals (PENDING status bookings)
    const pendingApprovals = await prisma.booking.count({
      where: {
        status: 'PENDING'
      }
    })

    // System status - check if database is accessible
    const systemStatus = 'online'

    return NextResponse.json({
      success: true,
      data: {
        activeBookings,
        todayRevenue,
        pendingApprovals,
        systemStatus
      }
    })
  } catch (error) {
    console.error('Error fetching real-time stats:', error)
    return NextResponse.json({
      success: false,
      data: {
        activeBookings: 0,
        todayRevenue: 0,
        pendingApprovals: 0,
        systemStatus: 'offline'
      },
      error: 'Failed to fetch real-time stats'
    }, { status: 500 })
  }
}

