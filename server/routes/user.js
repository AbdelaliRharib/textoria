const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    // Get generation counts
    const [totalGenerations, textGenerations, imageGenerations] = await Promise.all([
      prisma.generation.count({ where: { userId } }),
      prisma.generation.count({ where: { userId, type: 'TEXT' } }),
      prisma.generation.count({ where: { userId, type: 'IMAGE' } })
    ]);

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.generation.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // Get total tokens and cost
    const analytics = await prisma.analytics.findMany({
      where: { userId },
      select: {
        totalTokens: true,
        totalCost: true
      }
    });

    const totalTokens = analytics.reduce((sum, item) => sum + item.totalTokens, 0);
    const totalCost = analytics.reduce((sum, item) => sum + item.totalCost, 0);

    res.json({
      totalGenerations,
      textGenerations,
      imageGenerations,
      monthlyUsage,
      monthlyLimit: subscription?.monthlyLimit || 100,
      totalTokens,
      totalCost
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            monthlyLimit: true,
            currentUsage: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        avatar
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true
      }
    });

    res.json(updatedUser);

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;


