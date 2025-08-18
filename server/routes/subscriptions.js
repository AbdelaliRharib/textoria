const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        monthlyLimit: 100,
        features: [
          '100 generations per month',
          'Basic AI models',
          'Standard support',
          'Community access'
        ],
        popular: false
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29,
        monthlyLimit: 1000,
        features: [
          '1,000 generations per month',
          'Advanced AI models (GPT-4, DALL-E 3)',
          'Priority generation',
          'Email support',
          'Analytics dashboard',
          'Export capabilities'
        ],
        popular: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        monthlyLimit: 10000,
        features: [
          '10,000+ generations per month',
          'All AI models',
          'Priority support',
          'API access',
          'Custom models',
          'Dedicated account manager',
          'White-label options'
        ],
        popular: false
      }
    ];

    res.json({ plans });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get current user subscription
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get usage statistics
    const usage = await prisma.generation.count({
      where: {
        userId: req.user.userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    res.json({
      subscription,
      usage,
      remaining: Math.max(0, subscription.monthlyLimit - usage)
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Upgrade subscription (simplified - no payment processing)
router.post('/upgrade', auth, [
  body('plan').isIn(['FREE', 'PREMIUM', 'ENTERPRISE'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan } = req.body;

    // Define plan limits
    const planLimits = {
      FREE: 100,
      PREMIUM: 1000,
      ENTERPRISE: 10000
    };

    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user.userId },
      update: {
        plan,
        monthlyLimit: planLimits[plan],
        currentUsage: 0, // Reset usage for new plan
        status: 'ACTIVE'
      },
      create: {
        userId: req.user.userId,
        plan,
        monthlyLimit: planLimits[plan],
        status: 'ACTIVE'
      }
    });

    res.json({
      subscription,
      message: `Successfully upgraded to ${plan} plan`
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.userId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Downgrade to free plan instead of cancelling
    await prisma.subscription.update({
      where: { userId: req.user.userId },
      data: {
        plan: 'FREE',
        monthlyLimit: 100,
        status: 'ACTIVE'
      }
    });

    res.json({
      message: 'Subscription cancelled. You have been downgraded to the Free plan.'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get subscription history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // For now, we'll return the current subscription
    // In a real app, you'd have a subscription_history table
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    const history = subscription ? [{
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      monthlyLimit: subscription.monthlyLimit
    }] : [];

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: history.length,
        pages: Math.ceil(history.length / limit)
      }
    });

  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription history' });
  }
});

// Get usage statistics
router.get('/usage', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const [
      currentMonthUsage,
      dailyUsage,
      categoryUsage,
      typeUsage
    ] = await Promise.all([
      // Current month usage
      prisma.generation.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      // Daily usage for the period
      prisma.generation.groupBy({
        by: ['createdAt'],
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        },
        _count: { id: true },
        orderBy: { createdAt: 'desc' }
      }),
      // Usage by category
      prisma.generation.groupBy({
        by: ['category'],
        where: { userId: req.user.id },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      // Usage by type
      prisma.generation.groupBy({
        by: ['type'],
        where: { userId: req.user.id },
        _count: { id: true }
      })
    ]);

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    res.json({
      currentMonthUsage,
      dailyUsage,
      categoryUsage,
      typeUsage,
      limit: subscription?.monthlyLimit || 100,
      remaining: subscription ? Math.max(0, subscription.monthlyLimit - currentMonthUsage) : 100
    });

  } catch (error) {
    console.error('Get usage statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

module.exports = router;
