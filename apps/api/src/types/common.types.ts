import { z } from 'zod'

/**
 * Common reusable Zod schemas
 */

// UUID validation
export const uuidSchema = z.string().uuid()

// Email validation
export const emailSchema = z.string().email().toLowerCase()

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
})

export type PaginationParams = z.infer<typeof paginationSchema>

// Pagination metadata response
export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number()
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

// API Response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.string(), z.any()).optional()
      })
      .optional(),
    meta: z.record(z.string(), z.any()).optional()
  })

// Error response
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional()
  })
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

// Success response
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.record(z.string(), z.any()).optional()
  })

// Common field validations
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  )

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')

export const licensePlateSchema = z
  .string()
  .min(2, 'License plate must be at least 2 characters')
  .max(20, 'License plate must be at most 20 characters')
  .regex(
    /^[A-Z0-9\s-]+$/i,
    'License plate can only contain letters, numbers, spaces, and hyphens'
  )

export const postalCodeSchema = z
  .string()
  .min(3)
  .max(10)
  .regex(/^[A-Z0-9\s-]+$/i, 'Invalid postal code format')

// OTP code validation
export const otpCodeSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, 'OTP must be 6 digits')
