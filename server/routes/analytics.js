const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user analytics
router.get('/user', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const userId = req.user.id;

    const [
      analytics,
      generationStats,
      categoryStats,
      recentActivity
    ] = await Promise.all([
      // Daily analytics
      prisma.analytics.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: days
      }),
      // Generation statistics
      prisma.generation.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true },
        _sum: { cost: true }
      }),
      // Category statistics
      prisma.generation.groupBy({
        by: ['category'],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      // Recent activity
      prisma.generation.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          category: true,
          createdAt: true
        }
      })
    ]);

    // Calculate totals
    const totals = analytics.reduce((acc, item) => {
      acc.textGenerations += item.textGenerations;
      acc.imageGenerations += item.imageGenerations;
      acc.totalTokens += item.totalTokens;
      acc.totalCost += item.totalCost;
      return acc;
    }, {
      textGenerations: 0,
      imageGenerations: 0,
      totalTokens: 0,
      totalCost: 0
    });

    res.json({
      analytics,
      totals,
      generationStats,
      categoryStats,
      recentActivity
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get system analytics (admin only)
router.get('/system', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period = '30' } = req.query;
    const days = parseInt(period);

    const [
      userStats,
      generationStats,
      revenueStats,
      dailyStats,
      topUsers,
      topCategories
    ] = await Promise.all([
      // User statistics
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      }),
      // Generation statistics
      prisma.generation.groupBy({
        by: ['type'],
        _count: { id: true },
        _sum: { cost: true }
      }),
      // Revenue statistics
      prisma.generation.aggregate({
        _sum: { cost: true },
        _avg: { cost: true }
      }),
      // Daily statistics
      prisma.analytics.groupBy({
        by: ['date'],
        _sum: {
          textGenerations: true,
          imageGenerations: true,
          totalCost: true
        },
        orderBy: { date: 'desc' },
        take: days
      }),
      // Top users
      prisma.user.findMany({
        take: 10,
        include: {
          _count: { generations: true },
          subscription: true
        },
        orderBy: {
          generations: { _count: 'desc' }
        }
      }),
      // Top categories
      prisma.generation.groupBy({
        by: ['category'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      userStats,
      generationStats,
      revenueStats,
      dailyStats,
      topUsers,
      topCategories
    });

  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch system analytics' });
  }
});

module.exports = router;
