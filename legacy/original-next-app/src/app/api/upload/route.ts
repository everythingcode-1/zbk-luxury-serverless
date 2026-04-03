import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const type = formData.get('type') as string || 'vehicles' // 'vehicles' or 'blog'
    
    console.log(`📤 Upload request received:`, {
      fileCount: files.length,
      type
    })
    
    if (!files || files.length === 0) {
      console.error('❌ No files uploaded')
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // File system upload (works with Coolify, Docker, and local development)
    const uploadedFiles: string[] = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    
    console.log(`📁 Upload directory: ${uploadDir}`)
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      console.log(`📂 Creating directory: ${uploadDir}`)
      await mkdir(uploadDir, { recursive: true })
    }

    for (const file of files) {
      console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`)
      
      if (!file.type.startsWith('image/')) {
        console.warn(`⚠️ Skipping non-image file: ${file.name}`)
        continue // Skip non-image files
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.warn(`⚠️ File too large: ${file.name} (${file.size} bytes)`)
        return NextResponse.json({
          error: `File ${file.name} is too large. Maximum size is 5MB`
        }, { status: 400 })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      let prefix = 'vehicle'
      if (type === 'blog') prefix = 'blog'
      else if (type === 'hero') prefix = 'hero'
      const filename = `${prefix}_${timestamp}_${randomString}.webp`
      
      console.log(`💾 Generated filename: ${filename}`)
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Convert to WebP (and prevent overly large images)
      let webpBuffer: Buffer
      try {
        webpBuffer = await sharp(buffer)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer()
      } catch (err) {
        console.error(`❌ Failed to convert image to WebP: ${file.name}`, err)
        return NextResponse.json(
          { error: `Failed to process image ${file.name}` },
          { status: 400 }
        )
      }
      
      // Write file to public/uploads/{type}
      const filepath = join(uploadDir, filename)
      console.log(`💾 Writing file to: ${filepath}`)
      await writeFile(filepath, webpBuffer)
      
      // Verify file was written
      if (existsSync(filepath)) {
        console.log(`✅ File successfully written to disk`)
      } else {
        console.error(`❌ Failed to write file to disk`)
      }
      
      // Store relative path for database
      const relativePath = `/uploads/${type}/${filename}`
      uploadedFiles.push(relativePath)
      
      console.log(`✅ Uploaded: ${filename} (${webpBuffer.length} bytes)`)
      console.log(`📍 Relative path: ${relativePath}`)
    }

    console.log(`🎉 Successfully uploaded ${uploadedFiles.length} files`)
    
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} files`
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    
    // Log detailed error info
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({
      error: 'Failed to upload files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
