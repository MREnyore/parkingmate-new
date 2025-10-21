import type { FastifyInstance } from 'fastify'
import { validatePlate } from '../controllers/guest.controller.js'
import { otpRateLimitOptions } from '../middleware/rate-limiter.middleware.js'

export async function guestRoutes(server: FastifyInstance) {
  // Guest validation - no authentication (public endpoint with reCAPTCHA)
  server.post('/guest/validate-plate', {
    ...otpRateLimitOptions,
    handler: validatePlate
  })
}
