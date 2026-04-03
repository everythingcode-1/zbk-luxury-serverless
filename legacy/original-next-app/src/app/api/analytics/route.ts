import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('timeRange') || '6months'
  try {
    // Get all bookings and vehicles for accurate calculations
    const allBookings = await prisma.booking.findMany({
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        vehicleId: true
      }
    })

    const allVehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        status: true
      }
    })

    // Vehicle stats
    const vehicleStats = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    // Booking stats
    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    // Calculate revenue from PAID bookings (more accurate than just COMPLETED)
    const paidBookings = allBookings.filter(b => b.paymentStatus === 'PAID')
    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    // Calculate date range based on timeRange parameter
    const now = new Date()
    
    // Monthly revenue (current month)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyPaidBookings = paidBookings.filter(b => 
      new Date(b.createdAt) >= startOfMonth
    )
    const monthlyRevenue = monthlyPaidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    let startDate = new Date()
    let monthsBack = 6
    
    switch (timeRange) {
      case '1month':
        monthsBack = 1
        break
      case '3months':
        monthsBack = 3
        break
      case '6months':
        monthsBack = 6
        break
      case '1year':
        monthsBack = 12
        break
      default:
        monthsBack = 6
    }
    
    startDate.setMonth(now.getMonth() - monthsBack)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const monthlyTrendsMap = new Map<string, { bookings: number; revenue: number }>()
    
    // Initialize months based on timeRange
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyTrendsMap.set(monthKey, { bookings: 0, revenue: 0 })
    }

    // Process bookings from selected time range
    allBookings
      .filter(b => new Date(b.createdAt) >= startDate)
      .forEach(booking => {
        const date = new Date(booking.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const existing = monthlyTrendsMap.get(monthKey) || { bookings: 0, revenue: 0 }
        existing.bookings += 1
        // Only count revenue from paid bookings
        if (booking.paymentStatus === 'PAID') {
          existing.revenue += booking.totalAmount || 0
        }
        monthlyTrendsMap.set(monthKey, existing)
      })

    const monthlyTrends = Array.from(monthlyTrendsMap.entries()).map(([month, data]) => ({
      month,
      bookings: data.bookings,
      revenue: data.revenue
    }))

    // Popular vehicles
    const popularVehicles = await prisma.booking.groupBy({
      by: ['vehicleId'],
      _count: { vehicleId: true },
      orderBy: { _count: { vehicleId: 'desc' } },
      take: 5
    })

    const vehicleDetails = await Promise.all(
      popularVehicles.map(async (item) => {
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: item.vehicleId },
          select: { name: true, model: true }
        })
        return {
          ...vehicle,
          bookings: item._count.vehicleId
        }
      })
    )

    // Performance metrics
    const totalBookingsCount = allBookings.length
    const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length
    const paidBookingsCount = paidBookings.length
    const averageBookingValue = paidBookingsCount > 0 
      ? totalRevenue / paidBookingsCount 
      : 0
    const completionRate = totalBookingsCount > 0
      ? Math.round((completedBookings / totalBookingsCount) * 100)
      : 0
    
    const totalVehiclesCount = allVehicles.length
    const inUseVehicles = allVehicles.filter(v => v.status === 'IN_USE').length
    const utilizationRate = totalVehiclesCount > 0
      ? Math.round((inUseVehicles / totalVehiclesCount) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVehicles: totalVehiclesCount,
          totalBookings: totalBookingsCount,
          totalRevenue: totalRevenue,
          monthlyRevenue: monthlyRevenue
        },
        vehicleStats: vehicleStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        })),
        bookingStats: bookingStats.map(stat => ({
          status: stat.status,
          count: stat._count.status
        })),
        monthlyTrends: monthlyTrends,
        popularVehicles: vehicleDetails,
        performance: {
          averageBookingValue: averageBookingValue,
          completionRate: completionRate,
          utilizationRate: utilizationRate
        }
      }
    })

  } catch (error) {
    console.error('Analytics error, using mock data:', error)
    
    // Fallback mock analytics data
    const mockAnalytics = {
      overview: {
        totalVehicles: 12,
        totalBookings: 156,
        totalRevenue: 450000,
        monthlyRevenue: 85000
      },
      vehicleStats: [
        { status: 'AVAILABLE', count: 8 },
        { status: 'IN_USE', count: 3 },
        { status: 'MAINTENANCE', count: 1 }
      ],
      bookingStats: [
        { status: 'COMPLETED', count: 89 },
        { status: 'CONFIRMED', count: 34 },
        { status: 'PENDING', count: 23 },
        { status: 'CANCELLED', count: 10 }
      ],
      monthlyTrends: [
        { month: '2024-06', bookings: 18, revenue: 54000 },
        { month: '2024-07', bookings: 22, revenue: 66000 },
        { month: '2024-08', bookings: 28, revenue: 84000 },
        { month: '2024-09', bookings: 31, revenue: 93000 },
        { month: '2024-10', bookings: 26, revenue: 78000 },
        { month: '2024-11', bookings: 31, revenue: 93000 }
      ],
      popularVehicles: [
        { name: 'Mercedes S-Class', model: 'S450', bookings: 45 },
        { name: 'BMW X7', model: 'xDrive40i', bookings: 38 },
        { name: 'Audi A8', model: 'L 55 TFSI', bookings: 32 },
        { name: 'Toyota Alphard', model: 'Executive Lounge', bookings: 28 },
        { name: 'Range Rover', model: 'Vogue', bookings: 13 }
      ],
      performance: {
        averageBookingValue: 2885,
        completionRate: 89,
        utilizationRate: 75
      }
    }

    return NextResponse.json({
      success: true,
      data: mockAnalytics,
      fallback: true,
      message: 'Using mock analytics data - database not connected'
    })
  }
}
