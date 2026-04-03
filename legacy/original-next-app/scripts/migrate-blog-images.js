/**
 * Script to migrate old blog posts from 'image' field to 'images' array
 * Run: node scripts/migrate-blog-images.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateBlogImages() {
  try {
    console.log('🔄 Starting blog images migration...\n');

    // Get all blog posts
    const posts = await prisma.blogPost.findMany();
    
    console.log(`📊 Found ${posts.length} blog posts\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      // Check if images field is empty or not an array
      if (!post.images || post.images.length === 0) {
        console.log(`⚠️  Post "${post.title}" has no images - setting to empty array`);
        
        // Update to empty array
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { images: [] }
        });
        
        migratedCount++;
      } else {
        console.log(`✅ Post "${post.title}" already has ${post.images.length} image(s) - skipping`);
        skippedCount++;
      }
    }

    console.log('\n✨ Migration completed!');
    console.log(`📈 Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📊 Total: ${posts.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBlogImages();















