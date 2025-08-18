const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        subscription: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    req.userData = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is admin or moderator
const requireAdminOrModerator = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR')) {
    return res.status(403).json({ error: 'Admin or moderator access required' });
  }
  next();
};

// Check subscription limits
const checkSubscriptionLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user.subscription) {
      return res.status(403).json({ error: 'No active subscription found' });
    }

    if (user.subscription.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Subscription is not active' });
    }

    if (user.subscription.currentUsage >= user.subscription.monthlyLimit) {
      return res.status(403).json({ 
        error: 'Monthly generation limit reached',
        limit: user.subscription.monthlyLimit,
        used: user.subscription.currentUsage
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Subscription verification failed' });
  }
};

// Log admin actions
const logAdminAction = async (action, targetType = null, targetId = null, details = null) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action,
        targetType,
        targetId,
        details,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  } catch (error) {
    console.error('Admin log error:', error);
  }
};

// Default export for routes
module.exports = authenticateToken;

// Named exports for other middleware
module.exports.requireAdmin = requireAdmin;
module.exports.requireAdminOrModerator = requireAdminOrModerator;
module.exports.checkSubscriptionLimit = checkSubscriptionLimit;
module.exports.logAdminAction = logAdminAction;
