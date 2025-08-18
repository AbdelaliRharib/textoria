const express = require('express');
const router = express.Router();

// Health check endpoint for Railway
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TEXTORIA API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;

