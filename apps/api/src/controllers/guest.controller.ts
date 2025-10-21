import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { env } from '../config/env.js'
import { cameraEventService } from '../services/camera-event.service.js'
import { carService } from '../services/car.service.js'
import { guestService } from '../services/guest.service.js'
import { parkingSessionService } from '../services/parking-session.service.js'
import { recaptchaService } from '../services/recaptcha.service.js'
import { validationService } from '../services/validation.service.js'
import type { ValidateGuestPlateInput } from '../types/guest.types.js'

/**
 * Validate guest license plate with reCAPTCHA
 * This confirms a guest's parking and creates a parking session
 */
export async function validatePlate(
  request: FastifyRequest<{ Body: ValidateGuestPlateInput }>,
  reply: FastifyReply
) {
  try {
    const { licensePlate, recaptchaToken } = request.body

    // 1. Validate reCAPTCHA
    const recaptchaResult = await recaptchaService.verify(
      recaptchaToken,
      request.ip
    )
    if (!recaptchaResult.success) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'RECAPTCHA_FAILED',
          message: recaptchaResult.error ?? 'reCAPTCHA validation failed'
        }
      })
    }

    // 2. Normalize license plate
    const normalizedPlate =
      validationService.normalizeLicensePlate(licensePlate)

    // Validate format
    if (!validationService.validateLicensePlate(normalizedPlate)) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'INVALID_LICENSE_PLATE',
          message: 'Invalid license plate format'
        }
      })
    }

    // Use default org ID
    const orgId = env.DEFAULT_ORG_ID

    // 3. Check if plate belongs to a registered customer
    const car = await carService.findByLicensePlate(normalizedPlate, orgId)
    if (car) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'REGISTERED_VEHICLE',
          message:
            'This vehicle is already registered. Please use the customer login.'
        }
      })
    }

    // 4. Check if already confirmed guest
    const confirmedGuest = await guestService.findConfirmedByPlate(
      normalizedPlate,
      orgId
    )
    if (confirmedGuest) {
      return reply.code(StatusCodes.CONFLICT).send({
        success: false,
        error: {
          code: 'ALREADY_CONFIRMED',
          message: 'This vehicle has already been confirmed as a guest',
          details: {
            validUntil: confirmedGuest.expiresAt.toISOString()
          }
        }
      })
    }

    // 5. Check if pending guest entry exists
    const pendingGuest = await guestService.findPendingByPlate(
      normalizedPlate,
      orgId
    )
    if (!pendingGuest) {
      return reply.code(StatusCodes.NOT_FOUND).send({
        success: false,
        error: {
          code: 'NO_ENTRY_DETECTED',
          message:
            'No recent entry detected for this license plate. Please contact parking staff.'
        }
      })
    }

    // 6. Verify recent camera event (within confirmation window)
    const recentEvent = await cameraEventService.findRecentByPlateAndDirection(
      normalizedPlate,
      orgId,
      'entry',
      env.GUEST_CONFIRMATION_WINDOW_MINUTES
    )

    if (!recentEvent) {
      return reply.code(StatusCodes.BAD_REQUEST).send({
        success: false,
        error: {
          code: 'CONFIRMATION_WINDOW_EXPIRED',
          message: `No recent entry detected. The confirmation window is ${env.GUEST_CONFIRMATION_WINDOW_MINUTES} minutes.`
        }
      })
    }

    // 7. Confirm guest (extend expiry to full parking duration)
    const validUntil = new Date()
    validUntil.setHours(
      validUntil.getHours() + env.GUEST_PARKING_DURATION_HOURS
    )

    await guestService.confirm(pendingGuest.id, validUntil)

    // 8. Create parking session for guest (no customer/car ID)
    const session = await parkingSessionService.create({
      orgId,
      entryEventId: recentEvent.id,
      entryTime: recentEvent.timestamp,
      status: 'active'
    })

    request.log.info(
      `Guest confirmed: ${pendingGuest.id}, session created: ${session.id}`
    )

    return reply.send({
      success: true,
      data: {
        message: 'Guest parking validated successfully',
        validUntil: validUntil.toISOString()
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred validating guest plate'
      }
    })
  }
}
