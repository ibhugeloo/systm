interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  interval: number;
  maxRequests: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  options: RateLimiterOptions
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + options.interval });
    return { success: true, remaining: options.maxRequests - 1, resetIn: options.interval };
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}
