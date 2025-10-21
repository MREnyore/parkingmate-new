import type { FastifyReply, FastifyRequest } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { env } from '../config/env.js'
import { cameraEventService } from '../services/camera-event.service.js'
import { carService } from '../services/car.service.js'
import { customerService } from '../services/customer.service.js'
import { customerRegistrationTokenService } from '../services/customer-registration-token.service.js'
import { emailService } from '../services/email.service.js'
import { guestService } from '../services/guest.service.js'
import { parkingSessionService } from '../services/parking-session.service.js'
import { validationService } from '../services/validation.service.js'
import type { CameraEventInput } from '../types/camera-event.types.js'

/**
 * Process ALPR camera event (entry/exit)
 * This is the core business logic for the parking system
 */
export async function processEntry(
  request: FastifyRequest<{ Body: CameraEventInput }>,
  reply: FastifyReply
) {
  try {
    const {
      licensePlate,
      timestamp,
      cameraId,
      locationName,
      imageBase64,
      confidence,
      direction,
      deviceType,
      eventId
    } = request.body

    // Normalize license plate
    const normalizedPlate =
      validationService.normalizeLicensePlate(licensePlate)

    // Use default org ID or get from request context
    const orgId = env.DEFAULT_ORG_ID

    // 1. Create camera event record
    const cameraEvent = await cameraEventService.create({
      orgId,
      eventId,
      licensePlate: normalizedPlate,
      timestamp: new Date(timestamp),
      cameraId,
      locationName,
      imageBase64,
      confidence: confidence.toString(),
      direction,
      deviceType
    })

    request.log.info(
      `Camera event created: ${cameraEvent.id} for plate ${normalizedPlate} (${direction})`
    )

    // 2. Check if plate belongs to a registered car
    const car = await carService.findByLicensePlate(normalizedPlate, orgId)

    if (car) {
      // Car is registered to a customer
      const customer = await customerService.findById(car.ownerId)

      if (customer) {
        // 3a. Check if customer has completed registration
        if (!customer.registered) {
          // Customer exists but not registered yet
          // Check if registration token already exists
          const existingToken =
            await customerRegistrationTokenService.findByCustomerId(customer.id)

          if (!existingToken) {
            // Create registration token
            const token = validationService.generateToken(64)
            const tokenExpiry = new Date()
            tokenExpiry.setHours(
              tokenExpiry.getHours() + env.REGISTRATION_TOKEN_EXPIRY_HOURS
            )

            await customerRegistrationTokenService.create({
              customerId: customer.id,
              token,
              expiresAt: tokenExpiry,
              used: false
            })

            // Send registration email
            await emailService.sendVehicleDetectionEmailWithToken(
              customer.email,
              customer.name || 'Customer',
              token
            )

            request.log.info(`Registration email sent to ${customer.email}`)

            return reply.send({
              success: true,
              data: {
                message: 'Customer detected, registration email sent',
                eventId: cameraEvent.id,
                isGuestEntry: false,
                action: 'registration_email_sent' as const,
                details: {
                  customerId: customer.id,
                  registrationEmailSent: true
                }
              }
            })
          } else {
            // Token already exists, don't send another email
            request.log.info(
              `Registration token already exists for customer ${customer.id}`
            )
          }
        }

        // 3b. Customer is registered, handle entry/exit
        if (direction === 'entry') {
          // Check for active session
          let session = await parkingSessionService.findActiveByCarId(car.id)

          if (!session) {
            // Create new parking session
            session = await parkingSessionService.create({
              orgId,
              carId: car.id,
              customerId: customer.id,
              entryEventId: cameraEvent.id,
              entryTime: new Date(timestamp),
              status: 'active'
            })

            request.log.info(`New parking session created: ${session.id}`)

            return reply.send({
              success: true,
              data: {
                message: 'Parking session created',
                eventId: cameraEvent.id,
                isGuestEntry: false,
                action: 'parking_session_created' as const,
                details: {
                  customerId: customer.id,
                  sessionId: session.id
                }
              }
            })
          } else {
            // Update existing session with new entry event
            await parkingSessionService.update(session.id, {
              entryEventId: cameraEvent.id,
              entryTime: new Date(timestamp)
            })

            request.log.info(`Parking session updated: ${session.id}`)

            return reply.send({
              success: true,
              data: {
                message: 'Parking session updated',
                eventId: cameraEvent.id,
                isGuestEntry: false,
                action: 'parking_session_updated' as const,
                details: {
                  customerId: customer.id,
                  sessionId: session.id
                }
              }
            })
          }
        } else {
          // Exit event
          const session = await parkingSessionService.findActiveByCarId(car.id)

          if (session) {
            // Complete the session
            await parkingSessionService.complete(session.id, cameraEvent.id)

            request.log.info(`Parking session completed: ${session.id}`)

            return reply.send({
              success: true,
              data: {
                message: 'Parking session completed',
                eventId: cameraEvent.id,
                isGuestEntry: false,
                action: 'exit_processed' as const,
                details: {
                  customerId: customer.id,
                  sessionId: session.id
                }
              }
            })
          } else {
            request.log.warn(
              `No active session found for exit event (car: ${car.id})`
            )
          }
        }

        return reply.send({
          success: true,
          data: {
            message: 'Customer detected',
            eventId: cameraEvent.id,
            isGuestEntry: false,
            action: 'customer_detected' as const,
            details: {
              customerId: customer.id
            }
          }
        })
      }
    }

    // 4. Car not registered - handle as guest
    if (direction === 'entry') {
      // Check if guest entry already exists
      const existingGuest = await guestService.findPendingByPlate(
        normalizedPlate,
        orgId
      )

      if (!existingGuest) {
        // Create new guest entry (pending confirmation)
        const guestExpiry = new Date()
        guestExpiry.setMinutes(
          guestExpiry.getMinutes() + env.GUEST_CONFIRMATION_WINDOW_MINUTES
        )

        const guest = await guestService.create({
          orgId,
          licensePlate: normalizedPlate,
          status: 'PendingConfirmation',
          expiresAt: guestExpiry
        })

        request.log.info(`Guest entry created (pending): ${guest.id}`)

        return reply.send({
          success: true,
          data: {
            message: 'Guest entry created (pending confirmation)',
            eventId: cameraEvent.id,
            isGuestEntry: true,
            action: 'guest_created' as const,
            details: {
              guestId: guest.id
            }
          }
        })
      } else {
        request.log.info(`Guest entry already exists: ${existingGuest.id}`)

        return reply.send({
          success: true,
          data: {
            message: 'Guest entry already exists (pending confirmation)',
            eventId: cameraEvent.id,
            isGuestEntry: true,
            action: 'guest_created' as const,
            details: {
              guestId: existingGuest.id
            }
          }
        })
      }
    } else {
      // Exit event for unknown vehicle
      request.log.info(`Exit event for unknown vehicle: ${normalizedPlate}`)

      return reply.send({
        success: true,
        data: {
          message: 'Exit event processed (unknown vehicle)',
          eventId: cameraEvent.id,
          isGuestEntry: false,
          action: 'exit_processed' as const
        }
      })
    }
  } catch (error) {
    request.log.error(error)
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred processing camera event'
      }
    })
  }
}
