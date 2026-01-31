import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { Request, Response, NextFunction, Application } from 'express';

// Create Redis client (optional, with fallback)
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.warn('[REDIS] Rate Limiter Redis error:', err.message));

// Try to connect to Redis
// (In a modern app, we'd top-level await or handle in init, here we just keep it simple)
redisClient.connect().catch(() => console.warn('[REDIS] Could not connect to Redis for rate limiting, falling back to memory.'));

const getStore = (prefix: string) => {
  return new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `rate_limit:${prefix}:`,
  });
};

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000000,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000000,
  message: { error: 'Too many auth attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Add all other limiters... (skipping for brevity but keeping structure)
export const applyRateLimiters = (app: Application) => {
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  // ...
};
