import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { existsSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🧹 Starting cleanup of orphaned image references...')
    
    // Get all vehicles with images
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    })
    
    // Get all blogs with images
    const blogs = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        images: true
      }
    })
    
    // Get all hero sections with images
    const heroes = await prisma.heroSection.findMany({
      select: {
        id: true,
        headline: true,
        image: true
      }
    })
    
    let updatedVehicles = 0
    let updatedBlogs = 0
    let updatedHeroes = 0
    
    // Clean vehicle images
    for (const vehicle of vehicles) {
      if (vehicle.images && Array.isArray(vehicle.images)) {
        const validImages = vehicle.images.filter((img: string) => {
          if (!img) return false
          
          // Convert to file path
          const filePath = img.startsWith('/uploads/') 
            ? img.substring(9) // Remove '/uploads/'
            : img.startsWith('/api/uploads/')
              ? img.substring(12) // Remove '/api/uploads/'
              : img
          
          const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
          const exists = existsSync(fullPath)
          
          if (!exists) {
            console.log(`🗑️ Removing missing image from vehicle ${vehicle.name}: ${img}`)
          }
          
          return exists
        })
        
        if (validImages.length !== vehicle.images.length) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { images: validImages }
          })
          updatedVehicles++
        }
      }
    }
    
    // Clean blog images
    for (const blog of blogs) {
      if (blog.images && Array.isArray(blog.images)) {
        const validImages = blog.images.filter((img: string) => {
          if (!img) return false
          
          const filePath = img.startsWith('/uploads/') 
            ? img.substring(9)
            : img.startsWith('/api/uploads/')
              ? img.substring(12)
              : img
          
          const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
          const exists = existsSync(fullPath)
          
          if (!exists) {
            console.log(`🗑️ Removing missing image from blog ${blog.title}: ${img}`)
          }
          
          return exists
        })
        
        if (validImages.length !== blog.images.length) {
          await prisma.blogPost.update({
            where: { id: blog.id },
            data: { images: validImages }
          })
          updatedBlogs++
        }
      }
    }
    
    // Clean hero images
    for (const hero of heroes) {
      if (hero.image) {
        const filePath = hero.image.startsWith('/uploads/') 
          ? hero.image.substring(9)
          : hero.image.startsWith('/api/uploads/')
            ? hero.image.substring(12)
            : hero.image
        
        const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
        const exists = existsSync(fullPath)
        
        if (!exists) {
          console.log(`🗑️ Removing missing image from hero ${hero.headline}: ${hero.image}`)
          await prisma.heroSection.update({
            where: { id: hero.id },
            data: { image: '' }
          })
          updatedHeroes++
        }
      }
    }
    
    console.log(`✅ Cleanup complete:`)
    console.log(`   - Vehicles updated: ${updatedVehicles}`)
    console.log(`   - Blogs updated: ${updatedBlogs}`)
    console.log(`   - Heroes updated: ${updatedHeroes}`)
    
    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      updatedVehicles,
      updatedBlogs,
      updatedHeroes
    })
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup database' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
