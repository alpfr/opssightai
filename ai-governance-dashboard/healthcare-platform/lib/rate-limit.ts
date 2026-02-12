// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated service

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export async function rateLimit(
  identifier: string,
  maxRequests: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'),
  windowMs: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now();
  const key = `rate_limit:${identifier}`;

  // Initialize or get existing entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment count
  store[key].count++;

  // Check if limit exceeded
  const remaining = Math.max(0, maxRequests - store[key].count);
  const success = store[key].count <= maxRequests;

  return { success, remaining };
}

// Redis-based rate limiter (for production with Redis)
export async function rateLimitRedis(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number }> {
  // This is a placeholder for Redis implementation
  // Install: npm install redis
  // 
  // import { createClient } from 'redis';
  // const redis = createClient({ url: process.env.REDIS_URL });
  // 
  // const key = `rate_limit:${identifier}`;
  // const current = await redis.incr(key);
  // 
  // if (current === 1) {
  //   await redis.expire(key, Math.ceil(windowMs / 1000));
  // }
  // 
  // const remaining = Math.max(0, maxRequests - current);
  // const success = current <= maxRequests;
  // 
  // return { success, remaining };

  // Fallback to in-memory for now
  return rateLimit(identifier, maxRequests, windowMs);
}
