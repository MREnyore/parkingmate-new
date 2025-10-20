import type { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Request logger middleware - logs all incoming requests
 */
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const start = Date.now()

  // Log request
  request.log.info(
    {
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    },
    'Incoming request'
  )

  // Add response time logging
  reply.raw.on('finish', () => {
    const duration = Date.now() - start
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`
      },
      'Request completed'
    )
  })
}

/**
 * Sanitize sensitive data from logs
 */
function _sanitizeLogData<T extends Record<string, unknown>>(data: T): T | Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'accessToken',
    'otpCode',
    'recaptchaToken'
  ]
  const sanitized: Record<string, unknown> = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = _sanitizeLogData(sanitized[key] as Record<string, unknown>)
    }
  }

  return sanitized
}
