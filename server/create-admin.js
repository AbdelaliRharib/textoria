const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@textoria.com' },
      update: {
        password: adminPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      },
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
      update: {
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        monthlyLimit: 100000,
        currentUsage: 0
      },
      create: {
        userId: adminUser.id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        monthlyLimit: 100000,
        currentUsage: 0
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('👤 Email: admin@textoria.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: ADMIN');
    console.log('📊 Plan: ENTERPRISE (100,000 generations/month)');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
