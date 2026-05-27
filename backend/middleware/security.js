const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: false,
});

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://fashion-shop-0w91.onrender.com'];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : defaultOrigins;

const disableRateLimit = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.DISABLE_RATE_LIMIT).trim().toLowerCase()
);

function createLimiter(options) {
  if (disableRateLimit) {
    return (req, res, next) => next();
  }
  return rateLimit(options);
}

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS policy: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true,
};

// Rate limiter cho API chung (production-safe defaults)
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10000, // tối đa 10000 requests mỗi 15 phút
  message: { success: false, error: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho checkout
const checkoutLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 phút
  max: 300, // tối đa 300 đơn/phút
  message: { success: false, error: 'Quá nhiều yêu cầu thanh toán, vui lòng thử lại sau' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho auth
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: disableRateLimit ? 1000 : 5,
  message: { success: false, error: 'Quá nhiều lần thử, vui lòng thử lại sau 15 phút' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  securityHeaders,
  corsOptions,
  apiLimiter,
  checkoutLimiter,
  authLimiter,
};
