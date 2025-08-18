const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Mock payment processing - simulates card validation and payment
const processMockPayment = (cardNumber, expiryMonth, expiryYear, cvv, cardholderName) => {
  // Basic validation
  if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
    throw new Error('Invalid card number');
  }
  
  if (!expiryMonth || !expiryYear) {
    throw new Error('Invalid expiry date');
  }
  
  if (!cvv || cvv.length < 3 || cvv.length > 4) {
    throw new Error('Invalid CVV');
  }
  
  if (!cardholderName || cardholderName.trim().length < 2) {
    throw new Error('Invalid cardholder name');
  }
  
  // Simulate payment processing delay
  const processingTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
  
  // Simulate success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1;
  
  if (!isSuccess) {
    throw new Error('Payment declined. Please check your card details.');
  }
  
  return {
    success: true,
    transactionId: 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    processingTime
  };
};

// Create payment intent for subscription
router.post('/create-payment-intent', auth, [
  body('plan').isIn(['PREMIUM', 'ENTERPRISE']),
  body('planName').isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, planName } = req.body;

    // Define plan prices (in cents)
    const planPrices = {
      PREMIUM: 2900, // $29.00
      ENTERPRISE: 9900 // $99.00
    };

    const amount = planPrices[plan];

    // Create mock payment intent
    const paymentIntentId = 'pi_mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      clientSecret: paymentIntentId,
      amount,
      currency: 'usd'
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Process payment with card details
router.post('/process-payment', auth, [
  body('paymentIntentId').isString(),
  body('plan').isIn(['PREMIUM', 'ENTERPRISE']),
  body('cardNumber').isString().isLength({ min: 13, max: 19 }),
  body('expiryMonth').isInt({ min: 1, max: 12 }),
  body('expiryYear').isInt({ min: 2024, max: 2030 }),
  body('cvv').isString().isLength({ min: 3, max: 4 }),
  body('cardholderName').isString().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, plan, cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = req.body;

    // Process the payment
    const paymentResult = processMockPayment(cardNumber, expiryMonth, expiryYear, cvv, cardholderName);

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Define plan limits
    const planLimits = {
      PREMIUM: 1000,
      ENTERPRISE: 10000
    };

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId: req.user.userId
      },
      update: {
        plan,
        status: 'ACTIVE',
        monthlyLimit: planLimits[plan],
        currentUsage: 0,
        updatedAt: new Date()
      },
      create: {
        userId: req.user.userId,
        plan,
        status: 'ACTIVE',
        monthlyLimit: planLimits[plan],
        currentUsage: 0
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: req.user.userId,
        amount: plan === 'PREMIUM' ? 29.00 : 99.00,
        currency: 'USD',
        status: 'COMPLETED',
        transactionId: paymentResult.transactionId,
        plan,
        paymentMethod: 'CARD'
      }
    });

    res.json({
      success: true,
      message: 'Payment successful! Your subscription has been upgraded.',
      subscription,
      transactionId: paymentResult.transactionId
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
