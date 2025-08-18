const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(adminAuth);

// Debug route to check admin access
router.get('/debug', (req, res) => {
  res.json({
    message: 'Admin access working',
    user: req.user,
    userData: req.userData
  });
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalGenerations,
      premiumUsers,
      enterpriseUsers,
      textGenerations,
      imageGenerations,
      planDistribution
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.generation.count(),
      prisma.user.count({
        where: {
          subscription: {
            plan: 'PREMIUM'
          }
        }
      }),
      prisma.user.count({
        where: {
          subscription: {
            plan: 'ENTERPRISE'
          }
        }
      }),
      prisma.generation.count({ where: { type: 'TEXT' } }),
      prisma.generation.count({ where: { type: 'IMAGE' } }),
      prisma.user.findMany({
        include: {
          subscription: true
        }
      })
    ]);

    // Calculate total revenue (mock data for now)
    const totalRevenue = (premiumUsers * 29) + (enterpriseUsers * 99);

    // Calculate monthly growth (mock data)
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5;

    // Calculate average generations per user
    const averageGenerationsPerUser = totalUsers > 0 ? totalGenerations / totalUsers : 0;

    // Get top categories
    const topCategories = await prisma.generation.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 5
    });

    // Get daily generations for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyGenerations = await prisma.generation.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date manually
    const dailyCounts = {};
    dailyGenerations.forEach(gen => {
      const date = gen.createdAt.toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const formattedDailyGenerations = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    }));

    // Format plan distribution
    const planCounts = {};
    planDistribution.forEach(user => {
      const plan = user.subscription?.plan || 'FREE';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    
    const formattedPlanDistribution = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count
    }));

    res.json({
      totalUsers,
      activeUsers,
      totalGenerations,
      totalRevenue,
      premiumUsers,
      enterpriseUsers,
      monthlyGrowth,
      textGenerations,
      imageGenerations,
      averageGenerationsPerUser,
      topCategories: topCategories.map(c => ({
        category: c.category,
        count: c._count.category
      })),
      dailyGenerations: formattedDailyGenerations,
      planDistribution: formattedPlanDistribution
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: {
          select: {
            generations: true,
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: {
        subscription: true,
        generations: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            generations: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Toggle user status
router.patch('/users/:userId/toggle-status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.userId },
      data: { isActive: !user.isActive }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('User status toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user and all related data
    await prisma.user.delete({
      where: { id: req.params.userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role }
    });

    res.json(user);
  } catch (error) {
    console.error('User role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all generations
router.get('/generations', async (req, res) => {
  try {
    const generations = await prisma.generation.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(generations);
  } catch (error) {
    console.error('Generations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch generations' });
  }
});

// Get subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    // Get all users with their subscription plans
    const users = await prisma.user.findMany({
      include: {
        subscription: true
      }
    });

    // Count users by subscription plan manually
    const planCounts = {};
    users.forEach(user => {
      const plan = user.subscription?.plan || 'FREE';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    // Define the subscription plans
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        monthlyLimit: 100,
        features: ['100 generations/month', 'Basic support', 'Standard quality'],
        isActive: true,
        userCount: planCounts['FREE'] || 0,
        revenue: 0
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29,
        monthlyLimit: 1000,
        features: ['1000 generations/month', 'Priority support', 'High quality', 'Advanced features'],
        isActive: true,
        userCount: planCounts['PREMIUM'] || 0,
        revenue: (planCounts['PREMIUM'] || 0) * 29
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        monthlyLimit: 10000,
        features: ['10000 generations/month', '24/7 support', 'Highest quality', 'Custom features', 'API access'],
        isActive: true,
        userCount: planCounts['ENTERPRISE'] || 0,
        revenue: (planCounts['ENTERPRISE'] || 0) * 99
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Subscription plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Toggle subscription plan status
router.patch('/subscription-plans/:planId/toggle-status', async (req, res) => {
  try {
    // This is a mock implementation since we don't have a separate plans table
    // In a real implementation, you would have a plans table and toggle the status there
    res.json({ message: 'Plan status updated successfully' });
  } catch (error) {
    console.error('Plan status toggle error:', error);
    res.status(500).json({ error: 'Failed to toggle plan status' });
  }
});

module.exports = router;
