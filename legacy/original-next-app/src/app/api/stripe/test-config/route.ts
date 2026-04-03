import { NextRequest, NextResponse } from 'next/server'

// GET /api/stripe/test-config - Test Stripe configuration
export async function GET(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    
    const config = {
      hasSecretKey: !!secretKey,
      keyLength: secretKey?.length || 0,
      keyFirstChars: secretKey?.substring(0, 10) || 'N/A',
      keyStartsWithSk: secretKey?.startsWith('sk_') || false,
      keyStartsWithPk: secretKey?.startsWith('pk_') || false,
      trimmedKey: secretKey?.trim() || null,
      trimmedKeyStartsWithSk: secretKey?.trim().startsWith('sk_') || false,
      hasWhitespace: secretKey ? secretKey !== secretKey.trim() : false,
      allStripeEnvVars: Object.keys(process.env).filter(k => k.includes('STRIPE')),
      nodeEnv: process.env.NODE_ENV,
    }
    
    // Check if key is valid
    let isValid = false
    let errorMessage = null
    
    if (!secretKey) {
      errorMessage = 'STRIPE_SECRET_KEY is not set in environment variables'
    } else {
      const trimmed = secretKey.trim()
      if (trimmed.startsWith('pk_')) {
        errorMessage = 'You are using a PUBLISHABLE key (pk_) instead of a SECRET key (sk_). Please use your secret key.'
      } else if (!trimmed.startsWith('sk_')) {
        errorMessage = `Invalid key format. Key starts with "${trimmed.substring(0, 3)}" but should start with "sk_"`
      } else {
        isValid = true
      }
    }
    
    return NextResponse.json({
      success: isValid,
      valid: isValid,
      error: errorMessage,
      config,
      instructions: {
        ifNoKey: 'Add STRIPE_SECRET_KEY=sk_test_... to your .env.local file in the root directory',
        ifPublishableKey: 'Go to Stripe Dashboard → Developers → API keys → Reveal test key (SECRET key, not publishable)',
        ifInvalidFormat: 'Check your .env.local file. Make sure the key starts with "sk_test_" or "sk_live_"',
        restartServer: 'After adding/updating .env.local, restart your development server (npm run dev)',
        fileLocation: 'File .env.local should be in the root directory (same level as package.json)'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

