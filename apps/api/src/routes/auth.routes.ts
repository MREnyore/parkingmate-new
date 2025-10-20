import type { FastifyInstance } from 'fastify'
import {
  adminLogin,
  adminRegister,
  customerLogout,
  customerRefreshToken,
  customerSignin,
  getMe,
  logout,
  refreshToken,
  registerCustomer,
  validateAuthToken,
  validateRegistrationToken,
  verifyOtp
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import {
  authRateLimitOptions,
  otpRateLimitOptions
} from '../middleware/rate-limiter.middleware'

export async function authRoutes(server: FastifyInstance) {
  // Admin login
  server.post('/auth/login', {
    ...authRateLimitOptions,
    handler: adminLogin
  })

  // Admin register
  server.post('/auth/register', {
    ...authRateLimitOptions,
    handler: adminRegister
  })

  // Logout
  server.post('/auth/logout', logout)

  // Get current user (requires auth)
  server.get('/auth/me', {
    preHandler: [authMiddleware],
    handler: getMe
  })

  // Validate registration token
  server.post('/auth/validate-registration-token', validateRegistrationToken)

  // Customer registration - initiate (sends OTP)
  server.post('/auth/register-customer', {
    ...otpRateLimitOptions,
    handler: registerCustomer
  })

  // Customer signin (sends OTP)
  server.post('/auth/customer/signin', {
    ...otpRateLimitOptions,
    handler: customerSignin
  })

  // Verify OTP
  server.post('/auth/verify-otp', {
    ...authRateLimitOptions,
    handler: verifyOtp
  })

  // Refresh token (Admin)
  server.post('/auth/refresh-token', refreshToken)

  // Customer refresh token
  server.post('/auth/customer/refresh-token', customerRefreshToken)

  // Validate auth token
  server.post('/auth/validate-auth-token', validateAuthToken)

  // Customer logout
  server.post('/auth/customer/logout', customerLogout)
}
