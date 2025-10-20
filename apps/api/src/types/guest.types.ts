import { z } from 'zod'
import { licensePlateSchema } from './common.types'

/**
 * Guest validation-related Zod schemas
 */

// Validate Guest License Plate
export const validateGuestPlateSchema = z.object({
  body: z.object({
    licensePlate: licensePlateSchema,
    recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
  })
})

export type ValidateGuestPlateInput = z.infer<
  typeof validateGuestPlateSchema
>['body']

// Guest Validation Response
export const guestValidationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  validUntil: z.string().optional(), // ISO date string
  error: z.string().optional()
})

export type GuestValidationResponse = z.infer<
  typeof guestValidationResponseSchema
>
