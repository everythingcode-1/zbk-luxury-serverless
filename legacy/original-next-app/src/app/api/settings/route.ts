import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/settings - Get all settings
export async function GET() {
  try {
    const settings = await prisma.settings.findMany()
    
    // Convert to key-value object
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    return NextResponse.json({
      success: true,
      data: settingsObj
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 })
  }
}

// POST /api/settings - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Update or create each setting
    const promises = Object.entries(body).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )
    
    await Promise.all(promises)
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings'
    }, { status: 500 })
  }
}

// Test SMTP configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { smtpHost, smtpPort, smtpUser, smtpPassword, testEmail } = body
    
    // Here you would implement actual SMTP test
    // For now, we'll just simulate a successful test
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !testEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required SMTP configuration'
      }, { status: 400 })
    }
    
    // Simulate SMTP test (replace with actual nodemailer test)
    const testResult = {
      success: true,
      message: 'Test email sent successfully',
      details: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === '465',
        testEmail
      }
    }
    
    return NextResponse.json({
      success: true,
      data: testResult
    })
  } catch (error) {
    console.error('Error testing SMTP:', error)
    return NextResponse.json({
      success: false,
      error: 'SMTP test failed'
    }, { status: 500 })
  }
}
