import { z } from 'zod'
import {
    emailSchema,
    otpCodeSchema,
    passwordSchema,
    uuidSchema
} from './common.types'

/**
 * Authentication-related Zod schemas
 */

// Admin Login
export const adminLoginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
  })
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>['body']

// Admin Register
export const adminRegisterSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().optional(),
    orgId: uuidSchema.optional()
  })
})

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>['body']

// Customer Registration (Initiate - sends OTP)
export const customerRegisterInitiateSchema = z.object({
  body: z.object({
    registrationToken: z.string().min(1, 'Registration token is required')
  })
})

export type CustomerRegisterInitiateInput = z.infer<
  typeof customerRegisterInitiateSchema
>['body']

// Customer Signin (Initiate - sends OTP)
export const customerSigninSchema = z.object({
  body: z.object({
    email: emailSchema
  })
})

export type CustomerSigninInput = z.infer<typeof customerSigninSchema>['body']

// Verify OTP
export const verifyOtpSchema = z.object({
  body: z.object({
    email: emailSchema,
    otpCode: otpCodeSchema
  })
})

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body']

// Refresh Token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body']

// Logout
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
})

export type LogoutInput = z.infer<typeof logoutSchema>['body']

// Validate Registration Token
export const validateRegistrationTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required')
  })
})

export type ValidateRegistrationTokenInput = z.infer<
  typeof validateRegistrationTokenSchema
>['body']

// Validate Auth Token
export const validateAuthTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required')
  })
})

export type ValidateAuthTokenInput = z.infer<
  typeof validateAuthTokenSchema
>['body']

// Auth Response (Login/Register/Verify OTP)
export const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.literal('Bearer'),
  user: z
    .object({
      id: uuidSchema,
      email: emailSchema,
      role: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional()
    })
    .optional(),
  customer: z
    .object({
      id: uuidSchema,
      email: emailSchema,
      name: z.string().optional(),
      registered: z.boolean()
    })
    .optional()
})

export type AuthResponse = z.infer<typeof authResponseSchema>

// Registration Token Response
export const registrationTokenResponseSchema = z.object({
  valid: z.boolean(),
  customer: z
    .object({
      id: uuidSchema,
      email: emailSchema,
      name: z.string().nullable(),
      registered: z.boolean()
    })
    .optional(),
  error: z.string().optional()
})

export type RegistrationTokenResponse = z.infer<
  typeof registrationTokenResponseSchema
>

// Validate Auth Token Response
export const validateAuthTokenResponseSchema = z.object({
  valid: z.boolean(),
  expired: z.boolean(),
  payload: z
    .object({
      userId: uuidSchema.optional(),
      customerId: uuidSchema.optional(),
      email: emailSchema,
      role: z.string().optional(),
      type: z.enum(['access', 'refresh'])
    })
    .optional()
})

export type ValidateAuthTokenResponse = z.infer<
  typeof validateAuthTokenResponseSchema
>
