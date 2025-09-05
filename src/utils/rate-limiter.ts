// planLimits.ts
export const rateLimits = {
  Free: { points: 1, duration: 60 }, // 100 requests / min
  Pro: { points: 1000, duration: 60 }, // 1000 requests / min
};
