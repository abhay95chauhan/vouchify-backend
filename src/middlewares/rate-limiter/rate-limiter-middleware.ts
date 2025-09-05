import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { rateLimits } from '../../utils/rate-limiter';

const redisClient = new Redis({ host: '127.0.0.1', port: 6379 });

export const rateLimiterByPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orgId = req.user?.organization_id;
  if (!orgId) {
    return res.status(400).json({ message: 'Organization ID required' });
  }

  // Fetch org subscription plan from DB (mock example 👇)
  //   const orgPlan = await getOrgPlanFromDB(orgId); // e.g. "free" | "pro" | "enterprise"

  const { points, duration } = rateLimits['Free'];

  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: `rate_limit_${'Free'}`,
    points,
    duration,
  });

  try {
    await rateLimiter.consume(orgId);
    next();
  } catch {
    return res.status(429).json({
      message: `Rate limit exceeded for ${'free'} plan`,
    });
  }
};
