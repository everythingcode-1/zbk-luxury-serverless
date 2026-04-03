import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCustomerToken } from '@/lib/customer-auth';

/**
 * GET /api/customer/bookings
 * Get all bookings for the authenticated customer
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get customer ID
    const decoded = verifyCustomerToken(token);
    if (!decoded || decoded.type !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const customerId = decoded.customerId;

    // Get all bookings for this customer
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: customerId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            model: true,
            year: true,
            capacity: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch bookings',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
