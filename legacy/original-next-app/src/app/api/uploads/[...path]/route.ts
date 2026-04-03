import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Serve uploaded files from public/uploads directory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params (Next.js 16+ requires params to be awaited)
    const resolvedParams = await params
    // Reconstruct the path from params
    const filePath = resolvedParams.path.join('/')
    
    console.log(`📁 API Uploads: Requesting file: ${filePath}`)
    
    // Security: Only allow files from uploads directory
    if (filePath.includes('..') || !filePath.startsWith('vehicles/') && !filePath.startsWith('blog/') && !filePath.startsWith('hero/')) {
      console.error(`❌ Invalid file path: ${filePath}`)
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Construct full file path
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
    console.log(`📂 Full path: ${fullPath}`)
    
    // Check if file exists
    let resolvedFullPath = fullPath
    let resolvedFilePath = filePath
    if (!existsSync(resolvedFullPath)) {
      console.log(`🔍 File not found, checking alternatives...`)
      const ext = filePath.split('.').pop()?.toLowerCase()
      const base = ext ? filePath.slice(0, -(ext.length + 1)) : filePath

      const candidates: string[] = []
      
      // If looking for .webp, check for older formats
      if (ext === 'webp') {
        candidates.push(`${base}.jpg`, `${base}.jpeg`, `${base}.png`)
      } 
      // If looking for older format, check for .webp
      else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
        candidates.push(`${base}.webp`)
      }

      for (const candidate of candidates) {
        const candidateFullPath = join(process.cwd(), 'public', 'uploads', candidate)
        console.log(`🔍 Checking candidate: ${candidate}`)
        if (existsSync(candidateFullPath)) {
          resolvedFullPath = candidateFullPath
          resolvedFilePath = candidate
          console.log(`✅ Found file: ${candidate}`)
          break
        }
      }

      if (!existsSync(resolvedFullPath)) {
        console.error(`❌ File not found: ${fullPath}`)
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
    } else {
      console.log(`✅ File found directly: ${fullPath}`)
    }

    // Read file
    const fileBuffer = await readFile(resolvedFullPath)
    
    // Determine content type from file extension
    const extension = resolvedFilePath.split('.').pop()?.toLowerCase()
    const contentType = getContentType(extension || '')
    
    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('❌ Error serving file:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}

function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'pdf': 'application/pdf',
  }
  
  return contentTypes[extension] || 'application/octet-stream'
}

