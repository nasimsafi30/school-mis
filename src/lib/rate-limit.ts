// Simple in-memory rate limiter (replace with Upstash Redis in production)

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 10000
) {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs })
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: new Date(now + windowMs),
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - 1).toString(),
        'X-RateLimit-Reset': Math.floor((now + windowMs) / 1000).toString(),
      },
    }
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: new Date(entry.resetTime),
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.floor(entry.resetTime / 1000).toString(),
      },
    }
  }

  entry.count++
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: new Date(entry.resetTime),
    headers: {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': Math.floor(entry.resetTime / 1000).toString(),
    },
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}, 60000)
