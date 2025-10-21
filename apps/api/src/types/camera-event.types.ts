import { z } from 'zod'
import { licensePlateSchema, uuidSchema } from './common.types.js'

/**
 * Camera Event / ALPR-related Zod schemas
 */

// Camera Event Input (ALPR webhook)
export const cameraEventSchema = z.object({
  body: z.object({
    eventId: z.string().optional(),
    licensePlate: licensePlateSchema,
    timestamp: z
      .string()
      .datetime()
      .or(z.coerce.date().transform((d) => d.toISOString())),
    cameraId: z.string().min(1).max(100),
    locationName: z.string().max(255).optional(),
    imageBase64: z.string().optional(),
    confidence: z.coerce.number().min(0).max(1),
    direction: z.enum(['entry', 'exit']),
    deviceType: z.string().max(100).optional()
  })
})

export type CameraEventInput = z.infer<typeof cameraEventSchema>['body']

// Camera Event Response
export const cameraEventResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  eventId: uuidSchema,
  isGuestEntry: z.boolean(),
  action: z.enum([
    'customer_detected',
    'registration_email_sent',
    'guest_created',
    'parking_session_created',
    'parking_session_updated',
    'exit_processed'
  ]),
  details: z
    .object({
      customerId: uuidSchema.optional(),
      sessionId: uuidSchema.optional(),
      guestId: uuidSchema.optional(),
      registrationEmailSent: z.boolean().optional()
    })
    .optional()
})

export type CameraEventResponse = z.infer<typeof cameraEventResponseSchema>
