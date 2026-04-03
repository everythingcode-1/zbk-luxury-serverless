import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Path ke logo di folder public
    const logoPath = join(process.cwd(), 'public', 'logo-website.png');
    
    // Baca file logo
    const imageBuffer = await readFile(logoPath);
    
    // Return image dengan header yang sesuai
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return NextResponse.json(
      { error: 'Logo not found' },
      { status: 404 }
    );
  }
}

