/**
 * Seed Test Customers
 * Creates sample customer accounts for testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting customer seeding...\n');

  // Sample customers
  const customers = [
    {
      title: 'MR',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      password: 'Password123',
      facebookHandle: 'johndoe',
      instagramHandle: 'johndoe',
      isEmailVerified: true,
      isActive: true,
    },
    {
      title: 'MS',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+1234567891',
      password: 'Password123',
      instagramHandle: 'janesmith',
      twitterHandle: 'janesmith',
      isEmailVerified: true,
      isActive: true,
    },
    {
      title: 'MRS',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phoneNumber: '+1234567892',
      password: 'Password123',
      facebookHandle: 'sarahjohnson',
      linkedinHandle: 'sarah-johnson',
      isEmailVerified: true,
      isActive: true,
    },
    {
      title: 'DR',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'dr.brown@example.com',
      phoneNumber: '+1234567893',
      password: 'Password123',
      isEmailVerified: true,
      isActive: true,
    },
    {
      title: 'PROF',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'prof.davis@example.com',
      phoneNumber: '+1234567894',
      password: 'Password123',
      linkedinHandle: 'emily-davis',
      isEmailVerified: false, // Not verified yet
      isActive: true,
    },
  ];

  console.log('📝 Creating customers...\n');

  for (const customer of customers) {
    try {
      // Check if customer already exists
      const existing = await prisma.customer.findUnique({
        where: { email: customer.email },
      });

      if (existing) {
        console.log(`⚠️  Customer ${customer.email} already exists. Skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(customer.password, 10);

      // Create customer
      const created = await prisma.customer.create({
        data: {
          ...customer,
          password: hashedPassword,
        },
      });

      console.log(`✅ Created customer: ${customer.title} ${customer.firstName} ${customer.lastName}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Password: ${customer.password} (saved as hash)`);
      console.log(`   Verified: ${customer.isEmailVerified}\n`);
    } catch (error) {
      console.error(`❌ Error creating customer ${customer.email}:`, error.message);
    }
  }

  console.log('\n✨ Customer seeding completed!\n');
  console.log('📋 Summary:');
  const totalCustomers = await prisma.customer.count();
  const verifiedCustomers = await prisma.customer.count({
    where: { isEmailVerified: true },
  });
  console.log(`   Total customers: ${totalCustomers}`);
  console.log(`   Verified: ${verifiedCustomers}`);
  console.log(`   Unverified: ${totalCustomers - verifiedCustomers}\n`);

  console.log('🔑 Test Login Credentials:');
  console.log('   Email: john.doe@example.com');
  console.log('   Password: Password123\n');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

















