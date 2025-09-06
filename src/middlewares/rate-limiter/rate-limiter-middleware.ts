import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { rateLimits } from '../../utils/rate-limiter';
import { AppError } from '../../utils/app-error';

const redisClient = new Redis({ host: '127.0.0.1', port: 6379 });

export const rateLimiterByPlan = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  if (!req?.user) {
    next(new AppError('Authentication failed!', 401));
    return;
  }

  const orgId = req.user?.organization_id;
  if (!orgId) {
    next(
      new AppError(
        'You are not associate any organization, please create organization to access resources',
        401
      )
    );
    return;
  }
  const planName = req.user?.organization?.subcription?.name;

  const { points, duration } = rateLimits[planName as 'Free' | 'Pro'];

  const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: `rate_limit_${planName}`,
    points,
    duration,
  });

  try {
    await rateLimiter.consume(orgId);
    next();
  } catch {
    next(new AppError(`Rate limit exceeded for ${planName} plan`, 429));
    return;
  }
};
