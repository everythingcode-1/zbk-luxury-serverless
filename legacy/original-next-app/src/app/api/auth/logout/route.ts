import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    })

    // Clear the auth token cookie by setting it to empty and expiring it
    // Use same settings as login endpoint for consistency
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false, // Match login endpoint setting for localhost development
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/', // Ensure cookie is cleared for all paths
      expires: new Date(0) // Set expiration to epoch time
    })

    return response

  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 })
  }
}
