import { z } from 'zod'
import {
    emailSchema,
    passwordSchema,
    phoneSchema,
    uuidSchema
} from './common.types'

/**
 * Admin User-related Zod schemas
 */

// Get Admin Profile Response
export const adminProfileResponseSchema = z.object({
  id: uuidSchema,
  orgId: uuidSchema.nullable(),
  email: emailSchema,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  roles: z.string().nullable(),
  permissions: z.string().nullable(),
  isEmailVerified: z.boolean(),
  isActive: z.boolean(),
  role: z.string(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string() // ISO date string
})

export type AdminProfileResponse = z.infer<typeof adminProfileResponseSchema>

// Update Admin Profile
export const updateAdminProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: phoneSchema.optional()
  })
})

export type UpdateAdminProfileInput = z.infer<
  typeof updateAdminProfileSchema
>['body']

// Change Password
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema
  })
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body']

// Upload Profile Picture (multipart/form-data - no Zod schema needed, handled by Fastify multipart)
// Response schema
export const profilePictureResponseSchema = z.object({
  profilePictureUrl: z.string()
})

export type ProfilePictureResponse = z.infer<
  typeof profilePictureResponseSchema
>
