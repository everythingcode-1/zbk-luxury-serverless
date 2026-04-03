import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test-connection - Test database connection and return detailed info
export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test basic connection
    await prisma.$connect()
    
    // Test query execution
    const [
      vehicleCount,
      bookingCount,
      blogCount,
      userCount
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.booking.count(),
      prisma.blogPost.count(),
      prisma.user.count()
    ])
    
    // Test database info query
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        version() as version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    ` as any[]
    
    // Get table info
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as any[]
    
    const connectionTime = Date.now() - startTime
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      connectionTime: `${connectionTime}ms`,
      database: {
        version: dbInfo[0]?.version?.split(' ')[0] || 'Unknown',
        name: dbInfo[0]?.database_name || 'Unknown',
        user: dbInfo[0]?.current_user || 'Unknown',
        host: dbInfo[0]?.server_ip || 'Unknown',
        port: dbInfo[0]?.server_port || 'Unknown'
      },
      stats: {
        vehicles: vehicleCount,
        bookings: bookingCount,
        blogPosts: blogCount,
        users: userCount,
        totalRecords: vehicleCount + bookingCount + blogCount + userCount
      },
      tables: tables.map(t => ({
        name: t.table_name,
        type: t.table_type
      })),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      connectionTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        checkList: [
          'Verify DATABASE_URL in .env.local',
          'Check if database server is running',
          'Verify network connectivity',
          'Check database credentials',
          'Run: npm run db:generate',
          'Run: npm run db:push'
        ],
        commonIssues: [
          'SSL connection required - add ?sslmode=require',
          'Connection timeout - check firewall settings',
          'Authentication failed - verify credentials',
          'Database not found - check database name'
        ]
      }
    }, { status: 500 })
  }
}

// POST /api/test-connection - Force reconnect and test
export async function POST() {
  try {
    // Force disconnect first
    await prisma.$disconnect()
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reconnect and test
    const response = await GET()
    
    return response
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Force reconnection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
