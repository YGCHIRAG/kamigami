const express = require('express');
const cors = require('cors');
const errorHandler = require('./common/middleware/errorHandler');
const routes = require('./modules');
const AppError = require('./common/errors/AppError');

// Simple in-memory rate limiter middleware
const rateLimits = {};
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const limit = 150; // 150 requests per 15 mins
  const windowMs = 15 * 60 * 1000;

  if (!rateLimits[ip]) {
    rateLimits[ip] = { count: 1, resetTime: now + windowMs };
  } else {
    if (now > rateLimits[ip].resetTime) {
      rateLimits[ip] = { count: 1, resetTime: now + windowMs };
    } else {
      rateLimits[ip].count++;
    }
  }

  if (rateLimits[ip].count > limit) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }

  next();
};

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(rateLimiter);
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
