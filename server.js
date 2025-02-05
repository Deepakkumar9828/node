const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    res.status(429).json({
      success: false,
      message: `Too many requests from this IP. Please try again in ${
        Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      } seconds.`,
    });
  },
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip2 = req.ip || req.connection.remoteAddress;
    const uniqueKey = `${ip}-${req.userId || 'anonymous'}`;
    
    // Log the details for testing
    console.log('IP (from x-forwarded-for):', ip);
    console.log('IP (from req.ip):', ip2);
    console.log('Unique Key:', uniqueKey);
    console.log('X-Forwarded-For header:', req.headers['x-forwarded-for']);
    console.log('Remote Address:', req.connection.remoteAddress);
    
    return uniqueKey;
  }
});

app.use('/api', limiter);

app.get('/api/test', (req, res) => {
  res.json({ message: 'This is a test endpoint.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
