const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const passport = require('./config/passport');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 10000;

// Trust proxy for rate limiting behind load balancers
app.set('trust proxy', 1);

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔗 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Try to push schema to create tables if they don't exist
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.log('⚠️ Database tables might already exist or there was an issue');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    console.log('🔧 Checking for admin user...');
    const bcrypt = require('bcryptjs');
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@textoria.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
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
    await prisma.subscription.create({
      data: {
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
  }
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://textoriaai.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Passport Middleware
app.use(passport.initialize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Root route for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'TEXTORIA Backend API',
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      docs: 'Check the API documentation for available endpoints'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route for debugging
app.get('/test', (req, res) => {
  console.log('🧪 Test route requested');
  res.json({ 
    message: 'Test route working',
    timestamp: new Date().toISOString(),
    routes: ['/', '/health', '/test', '/api/health']
  });
});

// API Routes
console.log('🔧 Loading API routes...');

try {
  app.use('/api/health', require('./routes/health'));
  console.log('✅ Health route loaded');
} catch (error) {
  console.error('❌ Failed to load health route:', error);
}

try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth route loaded');
} catch (error) {
  console.error('❌ Failed to load auth route:', error);
}

try {
  app.use('/api/user', require('./routes/user'));
  console.log('✅ User route loaded');
} catch (error) {
  console.error('❌ Failed to load user route:', error);
}

try {
  app.use('/api/generations', require('./routes/generations'));
  console.log('✅ Generations route loaded');
} catch (error) {
  console.error('❌ Failed to load generations route:', error);
}

try {
  app.use('/api/generate', require('./routes/generate'));
  console.log('✅ Generate route loaded');
} catch (error) {
  console.error('❌ Failed to load generate route:', error);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin route loaded');
} catch (error) {
  console.error('❌ Failed to load admin route:', error);
}

try {
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✅ Analytics route loaded');
} catch (error) {
  console.error('❌ Failed to load analytics route:', error);
}

try {
  app.use('/api/subscriptions', require('./routes/subscriptions'));
  console.log('✅ Subscriptions route loaded');
} catch (error) {
  console.error('❌ Failed to load subscriptions route:', error);
}

try {
  app.use('/api/payments', require('./routes/payments'));
  console.log('✅ Payments route loaded');
} catch (error) {
  console.error('❌ Failed to load payments route:', error);
}

console.log('✅ All API routes loaded successfully');

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database Connection and Server Start
async function startServer() {
  try {
    // Initialize database and create tables
    await initializeDatabase();
    
    // Create admin user if it doesn't exist
    await createAdminUser();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 TEXTORIA Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your DATABASE_URL environment variable');
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
