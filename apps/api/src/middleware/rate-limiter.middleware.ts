import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

/**
 * Register rate limiting for authentication endpoints
 */
export async function registerRateLimiter(server: FastifyInstance) {
  await server.register(rateLimit, {
    global: false, // Don't apply globally
    max: 5, // Max 5 requests
    timeWindow: '15 minutes',
    cache: 10000,
    allowList: [], // IPs to exclude from rate limiting
    redis: undefined, // Can be configured for production with Redis
    skipOnError: true, // Don't fail if rate limiter fails
    keyGenerator: (request) => {
      // Use IP + endpoint for rate limiting key
      return `${request.ip}-${request.url}`
    },
    errorResponseBuilder: () => {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again in 15 minutes.'
        }
      }
    }
  })
}

/**
 * Rate limit options for sensitive endpoints
 */
export const authRateLimitOptions = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes'
    }
  }
}

/**
 * Rate limit options for OTP endpoints (stricter)
 */
export const otpRateLimitOptions = {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '15 minutes'
    }
  }
}

/**
 * Rate limit options for general API endpoints
 */
export const apiRateLimitOptions = {
  config: {
    rateLimit: {
      max: 100,
      timeWindow: '1 minute'
    }
  }
}
