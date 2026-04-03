const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedBlogPosts() {
  console.log('📝 Starting blog posts seed...')

  try {
    // Blog Post 1: Luxury Experience with Toyota Alphard
    const post1 = await prisma.blogPost.upsert({
      where: { slug: 'luxury-experience-toyota-alphard-premium' },
      update: {},
      create: {
        title: 'Luxury Experience with Toyota Alphard: Premium Vehicle for Business and Family Travel',
        slug: 'luxury-experience-toyota-alphard-premium',
        excerpt: 'Discover why Toyota Alphard has become the top choice for luxury travel worldwide. From advanced features to unparalleled comfort, learn everything you need to know about this premium MPV.',
        content: `
          <h2>The Ultimate Luxury MPV Experience</h2>
          <p>The Toyota Alphard represents the pinnacle of luxury multi-purpose vehicles, combining sophisticated design with cutting-edge technology to deliver an unmatched travel experience.</p>
          
          <h3>Premium Interior Design</h3>
          <p>Step inside the Alphard and you'll immediately notice the attention to detail. Premium leather seats, ambient lighting, and high-quality materials create an atmosphere of luxury that rivals the finest executive lounges.</p>
          
          <h3>Advanced Technology Features</h3>
          <ul>
            <li>Premium entertainment system with multiple screens</li>
            <li>Climate control for individual zones</li>
            <li>Wireless charging capabilities</li>
            <li>Advanced safety features including collision avoidance</li>
          </ul>
          
          <h3>Perfect for Every Occasion</h3>
          <p>Whether you're heading to an important business meeting, celebrating a wedding, or taking the family on vacation, the Toyota Alphard provides the perfect blend of comfort, style, and reliability.</p>
          
          <h3>Why Choose ZBK Luxury Transport</h3>
          <p>At ZBK Luxury Transport, we maintain our Alphard fleet to the highest standards. Our professional chauffeurs are trained to provide exceptional service, ensuring your journey is as smooth as it is luxurious.</p>
        `,
        image: '/4.-alphard-colors-black.png',
        author: 'ZBK Team',
        publishedAt: new Date('2024-11-20'),
        isPublished: true,
        tags: ['luxury', 'alphard', 'business-travel', 'family-transport']
      }
    })
    console.log('✅ Blog post 1 created:', post1.title)

    // Blog Post 2: Wedding Transportation Guide
    const post2 = await prisma.blogPost.upsert({
      where: { slug: 'ultimate-wedding-transportation-guide-jakarta' },
      update: {},
      create: {
        title: 'The Ultimate Wedding Transportation Guide: Making Your Special Day Perfect',
        slug: 'ultimate-wedding-transportation-guide-jakarta',
        excerpt: 'Planning your wedding transportation in Jakarta? Our comprehensive guide covers everything from choosing the right vehicle to coordinating with your wedding timeline.',
        content: `
          <h2>Your Wedding Day Deserves Perfect Transportation</h2>
          <p>Your wedding day is one of the most important days of your life, and every detail matters - including how you arrive at your venue. The right transportation can add elegance and ensure everything runs smoothly.</p>
          
          <h3>Choosing the Perfect Wedding Vehicle</h3>
          <p>When selecting your wedding transportation, consider these key factors:</p>
          <ul>
            <li><strong>Style and Elegance:</strong> Your vehicle should complement your wedding theme</li>
            <li><strong>Comfort:</strong> Ensure there's enough space for your dress and wedding party</li>
            <li><strong>Reliability:</strong> Choose a reputable service with well-maintained vehicles</li>
            <li><strong>Professional Service:</strong> Experienced chauffeurs who understand wedding protocols</li>
          </ul>
          
          <h3>Toyota Alphard: The Perfect Wedding Choice</h3>
          <p>The Toyota Alphard has become increasingly popular for weddings due to its:</p>
          <ul>
            <li>Spacious interior perfect for wedding dresses</li>
            <li>Elegant exterior that photographs beautifully</li>
            <li>Smooth ride quality for comfort</li>
            <li>Premium features for a luxury experience</li>
          </ul>
          
          <h3>Planning Your Wedding Transportation Timeline</h3>
          <p>Coordinate with your wedding planner to ensure:</p>
          <ul>
            <li>Pickup times align with photography schedules</li>
            <li>Buffer time for traffic and unexpected delays</li>
            <li>Multiple vehicles if needed for wedding party</li>
            <li>Return transportation for end of celebration</li>
          </ul>
          
          <h3>ZBK Luxury Transport Wedding Services</h3>
          <p>Our wedding transportation service includes:</p>
          <ul>
            <li>Decorated vehicles to match your theme</li>
            <li>Professional chauffeurs in formal attire</li>
            <li>Flexible timing to accommodate your schedule</li>
            <li>Backup vehicles for peace of mind</li>
          </ul>
        `,
        image: '/4.-alphard-colors-black.png',
        author: 'ZBK Wedding Specialist',
        publishedAt: new Date('2024-11-18'),
        isPublished: true,
        tags: ['wedding', 'transportation', 'jakarta', 'luxury-service']
      }
    })
    console.log('✅ Blog post 2 created:', post2.title)

    // Blog Post 3: Business Travel Tips
    const post3 = await prisma.blogPost.upsert({
      where: { slug: 'executive-business-travel-jakarta-tips' },
      update: {},
      create: {
        title: 'Executive Business Travel in Jakarta: Tips for Success',
        slug: 'executive-business-travel-jakarta-tips',
        excerpt: 'Navigate Jakarta\'s business landscape with confidence. Learn how premium transportation can enhance your professional image and productivity.',
        content: `
          <h2>Elevate Your Business Travel Experience</h2>
          <p>In Jakarta's competitive business environment, how you travel can significantly impact your professional image and success. Premium transportation isn't just about comfort - it's about making the right impression.</p>
          
          <h3>The Importance of Professional Transportation</h3>
          <p>When meeting with clients, partners, or stakeholders, arriving in a premium vehicle demonstrates:</p>
          <ul>
            <li>Attention to detail and professionalism</li>
            <li>Respect for the meeting and participants</li>
            <li>Success and reliability of your business</li>
            <li>Commitment to quality in all aspects</li>
          </ul>
          
          <h3>Maximizing Productivity During Travel</h3>
          <p>With a professional chauffeur handling the driving, you can:</p>
          <ul>
            <li>Prepare for meetings and review presentations</li>
            <li>Make important phone calls in privacy</li>
            <li>Respond to emails and messages</li>
            <li>Relax and arrive refreshed and focused</li>
          </ul>
          
          <h3>Jakarta Traffic Solutions</h3>
          <p>Our experienced chauffeurs know Jakarta's traffic patterns and can:</p>
          <ul>
            <li>Choose optimal routes to avoid congestion</li>
            <li>Adjust timing based on real-time traffic conditions</li>
            <li>Provide reliable arrival time estimates</li>
            <li>Suggest alternative meeting locations if needed</li>
          </ul>
          
          <h3>Premium Features for Business Travelers</h3>
          <p>Our executive vehicles include:</p>
          <ul>
            <li>WiFi connectivity for staying connected</li>
            <li>Power outlets for device charging</li>
            <li>Privacy partitions for confidential calls</li>
            <li>Climate control for optimal comfort</li>
            <li>Premium sound system for relaxation</li>
          </ul>
        `,
        image: '/4.-alphard-colors-black.png',
        author: 'ZBK Business Solutions',
        publishedAt: new Date('2024-11-15'),
        isPublished: true,
        tags: ['business-travel', 'executive', 'jakarta', 'productivity']
      }
    })
    console.log('✅ Blog post 3 created:', post3.title)

    // Blog Post 4: Airport Transfer Guide
    const post4 = await prisma.blogPost.upsert({
      where: { slug: 'jakarta-airport-transfer-luxury-guide' },
      update: {},
      create: {
        title: 'Jakarta Airport Transfer: Your Gateway to Luxury Travel',
        slug: 'jakarta-airport-transfer-luxury-guide',
        excerpt: 'Start and end your journey in style with premium airport transfer services. Learn about the benefits of luxury airport transportation in Jakarta.',
        content: `
          <h2>First Impressions Matter: Premium Airport Transfers</h2>
          <p>Your travel experience begins the moment you land and ends when you depart. Premium airport transfer services ensure both moments are memorable for all the right reasons.</p>
          
          <h3>Benefits of Premium Airport Transfer</h3>
          <ul>
            <li><strong>Reliability:</strong> Professional service you can count on</li>
            <li><strong>Comfort:</strong> Relax after a long flight in luxury</li>
            <li><strong>Efficiency:</strong> Skip taxi queues and ride-sharing wait times</li>
            <li><strong>Safety:</strong> Licensed, insured, and experienced drivers</li>
            <li><strong>Image:</strong> Arrive at your destination in style</li>
          </ul>
          
          <h3>Soekarno-Hatta International Airport Service</h3>
          <p>We provide comprehensive airport transfer services including:</p>
          <ul>
            <li>Flight monitoring for delays and early arrivals</li>
            <li>Meet and greet service at arrivals</li>
            <li>Assistance with luggage handling</li>
            <li>Direct routes to your destination</li>
            <li>Return scheduling for departure transfers</li>
          </ul>
          
          <h3>Vehicle Options for Every Need</h3>
          <p>Choose from our premium fleet:</p>
          <ul>
            <li><strong>Toyota Alphard:</strong> Perfect for executives and families</li>
            <li><strong>Toyota Vellfire:</strong> Ultimate luxury for VIP travelers</li>
            <li><strong>Toyota Hiace:</strong> Ideal for groups and corporate teams</li>
          </ul>
          
          <h3>Booking Your Airport Transfer</h3>
          <p>Make your reservation easy with:</p>
          <ul>
            <li>Online booking system available 24/7</li>
            <li>Flight details integration for accurate timing</li>
            <li>Flexible cancellation policies</li>
            <li>Multiple payment options</li>
            <li>Confirmation and driver details provided</li>
          </ul>
        `,
        image: '/4.-alphard-colors-black.png',
        author: 'ZBK Airport Services',
        publishedAt: new Date('2024-11-12'),
        isPublished: true,
        tags: ['airport-transfer', 'soekarno-hatta', 'luxury', 'travel']
      }
    })
    console.log('✅ Blog post 4 created:', post4.title)

    console.log('🎉 Blog posts seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding blog posts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedBlogPosts()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
