const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@textoria.com' },
    update: {},
    create: {
      email: 'admin@textoria.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true
    }
  });

  // Create admin subscription
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      monthlyLimit: 100000,
      currentUsage: 0
    }
  });

  // Create system settings
  const systemSettings = [
    {
      key: 'site_name',
      value: 'TEXTORIA',
      description: 'Platform name'
    },
    {
      key: 'site_description',
      value: 'AI-Powered Content Generation Platform',
      description: 'Platform description'
    },
    {
      key: 'max_generations_per_minute',
      value: '10',
      description: 'Maximum generations per minute per user'
    },
    {
      key: 'default_text_model',
      value: 'gpt-4',
      description: 'Default text generation model'
    },
    {
      key: 'default_image_model',
      value: 'dall-e-3',
      description: 'Default image generation model'
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Maintenance mode status'
    }
  ];

  for (const setting of systemSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting
    });
  }

  // Create sample categories for text generation
  const textCategories = [
    'Blog Posts',
    'Social Media Posts',
    'Email Marketing',
    'Product Descriptions',
    'Press Releases',
    'Newsletters',
    'Landing Pages',
    'Advertisements',
    'Creative Writing',
    'Technical Documentation'
  ];

  // Create sample categories for image generation
  const imageCategories = [
    'Logos',
    'Illustrations',
    'Photography',
    'Artwork',
    'Banners',
    'Icons',
    'Characters',
    'Landscapes',
    'Product Images',
    'Social Media Graphics'
  ];

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin user created: admin@textoria.com / admin123');
  console.log('⚙️ System settings configured');
  console.log('📝 Text categories: ' + textCategories.join(', '));
  console.log('🖼️ Image categories: ' + imageCategories.join(', '));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
