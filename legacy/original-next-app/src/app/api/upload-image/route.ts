import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 EditorJS image upload request received')
    
    const formData = await request.formData()
    console.log('Available fields:', Array.from(formData.keys()))
    
    // @editorjs/image sends file as 'image' field
    let file = formData.get('image') as File
    
    // Fallback to other common field names
    if (!file) {
      file = formData.get('file') as File
    }
    
    if (!file) {
      console.error('❌ No file found. Available keys:', Array.from(formData.keys()))
      return NextResponse.json(
        { success: 0, message: 'No file uploaded' },
        { status: 400 }
      )
    }
    
    console.log(`📄 File: ${file.name} (${file.type}, ${file.size} bytes)`)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: 0, message: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: 0, message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `blog_${timestamp}_${randomString}.webp`

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert to WebP for optimization
    let webpBuffer: Buffer
    try {
      webpBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
    } catch (err) {
      console.error('❌ Failed to convert image:', err)
      return NextResponse.json(
        { success: 0, message: 'Failed to process image' },
        { status: 400 }
      )
    }

    // Write file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, webpBuffer)

    // Return URL in EditorJS format
    const url = `/uploads/blog/${filename}`

    console.log('✅ Image uploaded:', url)

    // EditorJS expects this exact response format
    return NextResponse.json({
      success: 1,
      file: {
        url
      }
    })
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json(
      { success: 0, message: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
